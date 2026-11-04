# Seção de testes — NFSe Solutions

> Projeto/estrutura da seção de testes do trabalho. Dois níveis:
> **testes automatizados** (executados por máquina, reproduzíveis) e
> **validação manual** (checklist de demonstração na apresentação).

---

## 1. Visão geral

| Nível | Ferramenta | Onde roda | Comando | Status |
|---|---|---|---|---|
| Backend — testes de feature | PHPUnit (Laravel) | `TPNotafiscalAPI` | `php artisan test` | ✅ **25 testes, 25 passando** |
| Frontend — testes de unidade | Vitest | `NFSeApp` | `npm test` | ✅ **23 testes, 23 passando** |
| Frontend — tipos | TypeScript | `NFSeApp` | `npm run typecheck` | ✅ **0 erros** |
| Integração ponta a ponta | script cURL + servidor real | máquina local | ver §4 | ✅ **14/14** |
| Manual / demonstração | Checklist humano | celular + PC | ver §5 | 📋 checklist |

**Total: 62 verificações automatizadas.**

---

## 2. Testes do backend (PHPUnit) — `TPNotafiscalAPI/tests/Feature`

### `AuthTest.php` — autenticação por token (8 testes)
- login devolve `token` + dados do usuário
- login recusa **senha errada** e **e-mail inexistente** (422)
- login valida campos obrigatórios (422 + `assertJsonValidationErrors`)
- recursos da API **sem token → 401**
- recursos da API **com token → 200**
- rota `/api/user` devolve o usuário autenticado
- `/api/logout` revoga o token (requisição seguinte → 401)

### `NotaFiscalCrudTest.php` — CRUD principal (9 testes)
- índice paginado com relacionamentos (`fornecedor`, `produtos`)
- filtro por `fornecedor_id`
- criação vinculando produtos (pivot `quantidade`/`preco_compra`)
- rejeição de dados inválidos e fornecedor inexistente (422)
- upload de foto salvo no disco `public` (com `Storage::fake`)
- atualização de campos
- atualização **substitui a foto e apaga a antiga** (method spoofing `POST + _method=PUT`)
- exclusão remove nota, vínculos **e** a foto

### `FornecedorProdutoTest.php` — recursos auxiliares (8 testes)
- fluxo completo CRUD de fornecedor (create/read/update/delete)
- CNPJ duplicado → 422
- campos obrigatórios de fornecedor e produto
- fluxo completo CRUD de produto
- preço negativo → 422

### Como rodar

```bash
cd TPNotafiscalAPI
php artisan test          # tudo
php artisan test --filter=AuthTest   # só autenticação
```

> O banco de testes é SQLite **em memória** (`phpunit.xml`), criado a cada
> execução — não afeta o banco de desenvolvimento.

---

## 3. Testes do frontend (Vitest) — `NFSeApp/**/*.test.ts`

| Arquivo | O que cobre | Testes |
|---|---|---|
| `services/mediaUrl.test.ts` | URL da foto reconstruída com o IP da API (bug do `localhost`) | 5 |
| `features/notas-fiscais/types/NotaFiscalSchema.test.ts` | validação do formulário, itens, coerce e contrato da API | 9 |
| `features/notas-fiscais/utils/toFormData.test.ts` | montagem do multipart: campos, itens `produtos[i][campo]`, foto | 5 |
| `features/notas-fiscais/utils/apiErrors.test.ts` | erros 422 do Laravel → mensagens por campo | 3 |

> Por que **Vitest** e não emulador? Estes módulos são lógica pura (sem UI).
> Rodar em Node mantém a execução instantânea (< 1 s) e sem emulador.

### Como rodar

```bash
cd NFSeApp
npm test              # roda tudo
npm run typecheck     # validação de tipos (tsc --noEmit)
```

---

## 4. Teste de integração ponta a ponta (cURL)

Valida o fluxo completo contra o **servidor real** (`php artisan serve`),
exatamente como o app vai usar a API:

1. login com senha errada → **422**
2. login correto → **200 + token**
3. `GET /notas-fiscais` **sem** token → **401**
4. `GET` **com** token → **200**
5. `POST` cria nota (com itens) → **201**
6. `GET /{id}` → **200** · `PUT` → **200** e edição persiste · `DELETE` → **204** · `GET` após delete → **404**
7. `POST /logout` → **200** e o token usado fica **401** em seguida

Resultado da última execução: **14/14**.

---

## 5. Checklist de validação manual (demonstração na apresentação)

Executar no **celular real** (Expo Go) com a API rodando no PC:

- [ ] Login com senha errada mostra a mensagem de erro no campo
- [ ] Login correto entra na home exibindo **nome e e-mail** do usuário
- [ ] Home → "Sair da conta" volta para o login e bloqueia as telas internas
- [ ] Tentar acessar a lista deslogado redireciona para `/login`
- [ ] Lista carrega com *pull-to-refresh* e botão **"Carregar mais"** (paginação)
- [ ] Criar nota: **câmera** abre e permite fotografar a nota
- [ ] Criar nota: **galeria** seleciona foto existente
- [ ] Erro de campo (ex.: sem fornecedor) aparece **embaixo do campo**
- [ ] Selecionar produtos mostra quantidade/preço e a **soma dos itens**
- [ ] Foto aparece no card da lista e na edição
- [ ] Editar nota troca a foto (a antiga é substituída)
- [ ] Excluir pede confirmação e remove da lista
- [ ] Token expirado/revogado devolve para o login automaticamente

---

## 6. O que NÃO está coberto ainda (próximos passos)

| Área | Plano sugerido |
|---|---|
| Telas React Native | Detox (E2E em emulador) — ex.: criar nota inteira sem tocar no código |
| Hooks React Query | Testes com `renderHook` + mock do axios |
| Segurança | Rate limit no login; testes de autorização por usuário (Sanctum abilities) |
| OCR (futuro) | Testes de extração de campos com imagens de exemplo (fixtures) |
