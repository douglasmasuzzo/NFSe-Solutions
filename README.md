# NFSe Solutions

Projeto da disciplina de Dispositivos Móveis (FATEC Praia Grande).

- **`TPNotafiscalAPI/`** — Backend: API REST em Laravel com autenticação por
  token (Sanctum) e testes automatizados (Etapa 1).
- **`NFSeApp/`** — Frontend: app Expo com login, CRUD completo de Nota Fiscal
  (câmera/galeria, itens de produtos, paginação) usando react-hook-form, zod,
  @hookform/resolvers, axios e @tanstack/react-query, estruturado em
  `features/` (Etapa 2).

Veja o README de cada pasta para detalhes de cada parte. O passo a passo
completo para rodar o projeto do zero está logo abaixo.

------------------------------------------------

## Como executar o projeto

### Pré-requisitos

- **PHP 8.3+** (extensões `sqlite3`, `mbstring`, `openssl`, `fileinfo`) e **Composer**
- **Node.js** (versão LTS) e **npm**
- App **Expo Go** no celular (versão compatível com o Expo SDK 58) ou um emulador Android/iOS
- Computador e celular na **mesma rede Wi-Fi** (ou use o GitHub Codespaces — veja a variante mais abaixo)

### Passo 1 : Subir a API (backend)

```bash
cd TPNotafiscalAPI
composer install
cp .env.example .env              # no Windows (cmd): copy .env.example .env
php artisan key:generate
touch database/database.sqlite    # no Windows (PowerShell): New-Item database/database.sqlite
php artisan migrate --seed        # cria as tabelas + dados de exemplo + usuário de teste
php artisan storage:link          # necessário para as fotos das notas abrirem
php artisan serve --host=0.0.0.0 --port=8000
```

> `--host=0.0.0.0` é o que permite o **celular** alcançar a API pelo IP do
> computador. Sem ele, o `php artisan serve` só responde em `127.0.0.1`
> (o próprio computador) e o app recebe "Network Error".

Saída esperada ao final:

```
   INFO  Server running on [http://0.0.0.0:8000].

  Press Ctrl+C to stop the server
```

Deixe esse terminal aberto. Acessar `http://127.0.0.1:8000` no navegador mostra a
tela de boas-vindas do Laravel — isso é normal; a API vive em `/api/...`.

### Passo 2 : Conferir se a API responde (opcional, recomendado)

Em outro terminal, faça login com o usuário criado pelo seeder:

```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Accept: application/json" -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

Resposta esperada (o token muda a cada login):

```json
{"token":"1|AbCdEf...","user":{"id":1,"name":"Test User","email":"test@example.com"}}
```

Use o token para listar as notas fiscais (devem aparecer as 5 notas do seeder):

```bash
curl http://127.0.0.1:8000/api/notas-fiscais \
  -H "Accept: application/json" -H "Authorization: Bearer <cole-o-token-aqui>"
```

Sem o cabeçalho `Authorization`, a API responde **401** — é o comportamento correto.

### Passo 3 : Descobrir o IP do computador

O celular não enxerga `localhost`; ele precisa do IP do computador na rede local.

| Sistema | Comando | O que procurar |
|---|---|---|
| Windows | `ipconfig` | "Endereço IPv4" (ex.: `192.168.0.25`) |
| Linux | `ip addr` ou `hostname -I` | endereço `192.168.x.x` |
| macOS | `ipconfig getifaddr en0` | endereço `192.168.x.x` |

### Passo 4 : Rodar o app Expo (frontend)

```bash
cd NFSeApp
npm install
cp .env.example .env
```

Edite o `.env` e coloque o IP do passo 3 (com `/api` no final):

```
EXPO_PUBLIC_API_URL=http://192.168.0.25:8000/api
```

Depois inicie o Expo:

```bash
npx expo start
```

Escaneie o **QR code** exibido no terminal com o app **Expo Go** (Android: dentro do
próprio Expo Go; iOS: pela câmera do celular). Para emulador, use `a` (Android) ou
`i` (iOS) no terminal do Expo.

### Passo 5 : Usar o app

1. Na tela de login, entre com `test@example.com` / `password` (ou toque em
   **Criar conta**).
2. Abra **Ver notas fiscais** → a lista traz as notas de exemplo.
3. Teste o CRUD: **+ Nova nota** (com foto pela câmera ou galeria), toque numa nota
   para **editar** e use o ícone de lixeira para **excluir**.

### Variante: rodando no GitHub Codespaces

1. No terminal do Codespace, execute o **Passo 1** normalmente
   (`php artisan serve --host=0.0.0.0 --port=8000`).
2. Na aba **Portas** do VS Code, localize a porta `8000` e mude a visibilidade para
   **Public**. Copie a URL gerada (ex.: `https://nome-do-codespace-8000.app.github.dev`).
3. No `NFSeApp/.env`, use essa URL com `/api` no final:

   ```
   EXPO_PUBLIC_API_URL=https://nome-do-codespace-8000.app.github.dev/api
   ```

4. Rode `npx expo start` (se o QR code não conectar a partir do Codespace, use
   `npx expo start --tunnel`).

### Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `composer install` reclama que o pacote "requires php >=8.4.1" | `composer.lock` gerado com PHP mais novo que o instalado | Rodar `composer update` e depois `composer install` |
| `could not find driver` ao migrar | extensão SQLite do PHP desativada | Habilitar `pdo_sqlite` / `sqlite3` no `php.ini` |
| App mostra "Network Error" / timeout | API sem `--host=0.0.0.0`, IP errado no `.env`, firewall ou celular em outra rede | Conferir os passos 1, 3 e 4; liberar a porta 8000 no firewall |
| Mudei o `.env` do app e nada mudou | o Expo lê as variáveis só ao iniciar | Parar e rodar `npx expo start -c` |
| Fotos das notas não abrem | faltou o `storage:link` | `php artisan storage:link` |
| App volta para o login sozinho | token expirado/revogado (API respondeu 401) | Entrar novamente |
| Quero recomeçar o banco do zero | — | `php artisan migrate:fresh --seed` |

----------------------------------

## Acesso de teste

```
e-mail: test@example.com
senha:  password
```

(Criado pelo seeder: `php artisan db:seed` no backend. Também dá para
**criar uma conta nova** pelo app, na tela "Criar conta".)

------------------------------------------

## Documentação

- [`docs/APRESENTACAO.md`](docs/APRESENTACAO.md) — roteiro de apresentação com
  diagramas (arquitetura, autenticação, modelo de dados, fluxo da foto) e
  respostas prontas para perguntas.
- [`docs/ANALISE_E_MELHORIAS.md`](docs/ANALISE_E_MELHORIAS.md) — análise da
  estrutura atual, problemas identificados e roadmap de melhorias.
- [`docs/TESTES.md`](docs/TESTES.md) — seção de testes: cobertura dos 62
  testes automatizados (backend + app + integração) e checklist manual de
  demonstração.

------------------------------------------

## Testes

```bash
# Backend (30 testes)
cd TPNotafiscalAPI && php artisan test

# Frontend (31 testes + validação de tipos)
cd NFSeApp && npm test && npm run typecheck
```

-------------------------------------------

## Integrantes e Responsabilidades
- _Moises Santana (Desenvolvimento Backend)_
- _Tiago Felipe (Desenvolvimento Frontend)_
- _Douglas Masuzzo (Auxiliar)_
