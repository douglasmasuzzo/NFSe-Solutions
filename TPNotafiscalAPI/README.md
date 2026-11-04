# TPNotafiscalAPI

Backend do NFSe Solutions — API REST em **Laravel 13** (PHP ≥ 8.3) com
autenticação por token (**Laravel Sanctum**) e **30 testes automatizados**.

## Requisitos

- PHP 8.3+ com extensões: `sqlite3`, `mbstring`, `openssl`, `fileinfo`
- Composer
- (opcional) Node.js — só para o script `composer setup`, que compila assets

## Setup

```bash
composer install

# ambiente local
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed      # estrutura + dados de exemplo + usuário de teste

php artisan storage:link        # Necessário para servir as fotos das notas
                                # (sem isso, as imagens não abrem)

php artisan serve               # API em http://127.0.0.1:8000
```

> Também existe o atalho `composer setup` (instala, configura o `.env`,
> migra e compila os assets), mas os passos acima são os recomendados para
> desenvolvimento.

### Usuário de teste (login)

Criado pelo `DatabaseSeeder` com a senha **já criptografada** (bcrypt):

```
e-mail: test@example.com
senha:  password
```

## Autenticação (Sanctum)

Todas as rotas de recurso exigem o cabeçalho `Authorization: Bearer <token>`:

1. `POST /api/login` com `{ "email": "...", "password": "..." }` →
   devolve `{ "token": "...", "user": { ... } }`
   - Ou `POST /api/register` com `{ "name", "email", "password",
     "password_confirmation" }` para **criar uma conta nova** (a senha é
     validada com mínimo de 8 caracteres e gravada criptografada; a resposta
     é a mesma do login, então o usuário já entra logado)
2. Use o token em todas as demais requisições
3. `POST /api/logout` revoga o token atual

Sem token (ou com token revogado), a API responde **401**.

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/login` | autentica e emite token |
| POST | `/api/register` | cria conta nova e emite token (senha bcrypt) |
| POST | `/api/logout` | revoga o token usado |
| GET | `/api/user` | dados do usuário autenticado |
| GET | `/api/notas-fiscais` | lista paginada (aceita `?page=&fornecedor_id=`) |
| POST | `/api/notas-fiscais` | cria nota (multipart: campos + `imagem_nf` + `produtos[i][...]`) |
| GET | `/api/notas-fiscais/{nota}` | detalha nota (com fornecedor e produtos) |
| PUT/PATCH | `/api/notas-fiscais/{nota}` | atualiza (com foto nova: `POST` + `_method=PUT`) |
| DELETE | `/api/notas-fiscais/{nota}` | exclui (apaga foto e vínculos) |
| GET/POST/PUT/DELETE | `/api/fornecedores`, `/api/fornecedores/{fornecedor}` | CRUD de fornecedores |
| GET/POST/PUT/DELETE | `/api/produtos`, `/api/produtos/{produto}` | CRUD de produtos |

Lista completa: `php artisan route:list --path=api`

> **Nota técnica:** os parâmetros de rota dos recursos são fixados com
> `->parameters()` em `routes/api.php`. Sem isso, o singularizador do Laravel
> gera `{notas-fiscai}`/`{fornecedore}` (plural em inglês), o *implicit
> binding* não casa com o parâmetro do controller e `show`/`update`/`destroy`
> recebem um model vazio.

## Testes

```bash
php artisan test                          # tudo (30 testes)
php artisan test --filter=AuthTest        # autenticação + cadastro (13)
php artisan test --filter=NotaFiscalCrudTest   # CRUD da nota (9)
php artisan test --filter=FornecedorProdutoTest # recursos auxiliares (8)
```

- Banco de teste: SQLite **em memória** (`phpunit.xml`) — criado a cada
  execução, não afeta o banco de desenvolvimento.
- Cobertura detalhada em [`../docs/TESTES.md`](../docs/TESTES.md).

## Estrutura

```
routes/api.php              → login/logout + recursos protegidos
app/Http/Controllers/       → NotaF, Fornecedor, Produto
app/Models/                 → NotaF, Fornecedor, Produto, User (HasApiTokens)
database/migrations/        → 8 migrações
database/seeders/           → dados de exemplo + usuário de teste
database/factories/         → fábricas usadas nos testes
tests/Feature/              → 30 testes (PHPUnit)
storage/app/public/         → fotos das notas (via storage:link)
```
