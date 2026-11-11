#!/usr/bin/env bash
# Teste de integração ponta a ponta — NFSe Solutions (21 verificações)
set -u
API="http://127.0.0.1:8000/api"
PASS=0; FAIL=0

check() { # check "descrição" "esperado" "obtido"
  if [ "$2" = "$3" ]; then
    PASS=$((PASS+1)); echo "  ✓ $1 ($3)"
  else
    FAIL=$((FAIL+1)); echo "  ✗ $1 — esperado $2, obtido $3"
  fi
}

echo "== 1. Login com senha errada =="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/login" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"email":"test@example.com","password":"senha-errada"}')
check "login errado → 422" "422" "$CODE"

echo "== 2. Login correto =="
BODY=$(curl -s -X POST "$API/login" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"email":"test@example.com","password":"password"}')
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/login" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"email":"test@example.com","password":"password"}')
check "login certo → 200" "200" "$CODE"
TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$TOKEN" ] && check "token recebido" "sim" "sim" || check "token recebido" "sim" "não"
AUTH="Authorization: Bearer $TOKEN"
PAPEL_ADMIN=$(echo "$BODY" | grep -o '"role":"[^"]*"' | head -1)
check "seeder é admin" '"role":"admin"' "$PAPEL_ADMIN"

echo "== 3. Sem token =="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API/notas-fiscais" -H "Accept: application/json")
check "GET notas sem token → 401" "401" "$CODE"

echo "== 4. Com token =="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API/notas-fiscais" -H "$AUTH" -H "Accept: application/json")
check "GET notas com token → 200" "200" "$CODE"

echo "== 5. Criar nota com itens =="
FID=$(curl -s "$API/fornecedores" -H "$AUTH" -H "Accept: application/json" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
PID=$(curl -s "$API/produtos" -H "$AUTH" -H "Accept: application/json" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
NOW=$(date +%Y-%m-%d)
BODY=$(curl -s -w "\n%{http_code}" -X POST "$API/notas-fiscais" -H "$AUTH" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"numero\":\"SMOKE-$$\",\"dt_emissao\":\"$NOW\",\"valor_total\":10.50,\"forma_pagamento\":\"Pix\",\"fornecedor_id\":$FID,\"produtos\":[{\"produto_id\":$PID,\"quantidade\":1,\"preco_compra\":10.50}]}")
CODE=$(echo "$BODY" | tail -1)
check "POST nota → 201" "201" "$CODE"
NOTA_ID=$(echo "$BODY" | head -n -1 | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
[ -n "$NOTA_ID" ] && check "id retornado" "sim" "sim" || check "id retornado" "sim" "não"

echo "== 6. Ler, editar e excluir =="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API/notas-fiscais/$NOTA_ID" -H "$AUTH" -H "Accept: application/json")
check "GET /{id} → 200" "200" "$CODE"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API/notas-fiscais/$NOTA_ID" -H "$AUTH" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"fornecedor_id\":$FID,\"numero\":\"SMOKE-$$\",\"dt_emissao\":\"$NOW\",\"valor_total\":99.99,\"forma_pagamento\":\"Pix\"}")
check "PUT → 200" "200" "$CODE"
VALOR=$(curl -s "$API/notas-fiscais/$NOTA_ID" -H "$AUTH" -H "Accept: application/json" | grep -oE '"valor_total":.?99\.99' | head -1)
check "edição persistida (sim)" "sim" "$([ "$VALOR" = '"valor_total":"99.99' ] || [ "$VALOR" = '"valor_total":99.99' ] && echo sim || echo nao)"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API/notas-fiscais/$NOTA_ID" -H "$AUTH" -H "Accept: application/json")
check "DELETE → 204 (admin)" "204" "$CODE"
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API/notas-fiscais/$NOTA_ID" -H "$AUTH" -H "Accept: application/json")
check "nota excluída → 404" "404" "$CODE"

echo "== 7. Logout revoga o token =="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/logout" -H "$AUTH" -H "Accept: application/json")
check "POST logout → 200" "200" "$CODE"
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API/notas-fiscais" -H "$AUTH" -H "Accept: application/json")
check "token revogado → 401" "401" "$CODE"

# Re-login: a seção 8 em diante precisa de token válido de novo
BODY=$(curl -s -X POST "$API/login" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"email":"test@example.com","password":"password"}')
TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
AUTH="Authorization: Bearer $TOKEN"

echo "== 8. Cadastro de nova conta =="
NOVO_EMAIL="smoke-$RANDOM-$$@fatec.pg"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/register" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"name\":\"Smoke Test\",\"email\":\"$NOVO_EMAIL\",\"password\":\"senha1234\",\"password_confirmation\":\"senha1234\"}")
check "POST register → 201" "201" "$CODE"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/register" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"name\":\"Duplo\",\"email\":\"$NOVO_EMAIL\",\"password\":\"senha1234\",\"password_confirmation\":\"senha1234\"}")
check "e-mail duplicado → 422" "422" "$CODE"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/login" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"$NOVO_EMAIL\",\"password\":\"senha1234\"}")
check "login com conta criada → 200" "200" "$CODE"

echo "== 9. Nível de acesso (roles) =="
PAPEL=$(curl -s -X POST "$API/login" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"$NOVO_EMAIL\",\"password\":\"senha1234\"}" | grep -o '"role":"[^"]*"' | head -1)
check "conta nova nasce como 'user'" '"role":"user"' "$PAPEL"
TOKEN_COMUM=$(curl -s -X POST "$API/login" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"$NOVO_EMAIL\",\"password\":\"senha1234\"}" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API/fornecedores/$FID" \
  -H "Authorization: Bearer $TOKEN_COMUM" -H "Accept: application/json")
check "exclusão com nível comum → 403" "403" "$CODE"
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API/fornecedores/$FID" -H "Authorization: Bearer $TOKEN_COMUM" -H "Accept: application/json")
check "fornecedor continua de pé após 403 → 200" "200" "$CODE"

echo
echo "RESULTADO: $PASS passaram, $FAIL falharam"
[ "$FAIL" -eq 0 ]
