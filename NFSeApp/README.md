# NFSeApp

App Expo (React Native + TypeScript) para o CRUD de Notas Fiscais, com
**login por token** e **captura de foto pela câmera**, consumindo a API
Laravel em `../TPNotafiscalAPI`.

## Bibliotecas exigidas pela disciplina

- `react-hook-form` — gerenciamento do formulário
- `zod` — validação e contrato de dados (`features/notas-fiscais/types/NotaFiscalSchema.ts`)
- `@hookform/resolvers` — integração RHF + Zod
- `axios` — cliente HTTP (`services/api.ts`)
- `@tanstack/react-query` — cache e sincronização de dados do servidor

## Estrutura (padrão "Features")

```
features/auth/        → autenticação completa
  context/AuthContext.tsx    → sessão do usuário (restaura token salvo)
  components/RequireAuth.tsx → guarda de rotas (sem login → /login)
  hooks/useLogin.ts, useRegister.ts, useLogout.ts
  screens/LoginScreen.tsx, RegisterScreen.tsx
  utils/tokenStorage.ts      → token no expo-secure-store (criptografado)
features/notas-fiscais/
  types/     → contratos Zod (entrada do form x saída da API)
  hooks/     → React Query (useNotasFiscais, useCreateNotaFiscal, ...)
  components/→ NotaFiscalForm (câmera + galeria + itens), NotaFiscalCard
  screens/   → telas completas (List, Create, Edit, Delete)
  utils/     → toFormData (multipart), apiErrors (422 → campo)
app/         → rotas do Expo Router, finas; rotas protegidas usam RequireAuth
services/    → api.ts (axios + Bearer + 401), mediaUrl.ts (URL das fotos)
```

## Setup

```bash
npm install
cp .env.example .env   # edite EXPO_PUBLIC_API_URL com o IP da sua máquina
npx expo start
```

A API Laravel precisa estar rodando (`php artisan serve`) e acessível pelo
IP configurado em `EXPO_PUBLIC_API_URL` — "localhost" não funciona a partir
de um dispositivo físico ou emulador.

## Login e cadastro

A tela inicial pede autenticação. Duas opções:

- **Entrar** com o usuário criado pelo seeder do backend
  (`php artisan db:seed`):

  ```
  e-mail: test@example.com
  senha:  password
  ```

- **Criar conta** (tela de cadastro): valida nome, e-mail, senha (mínimo de 8
  caracteres) e confirmação; o backend grava a senha criptografada e já
  devolve o token — o usuário novo entra no app sem precisar logar. E-mail já
  cadastrado é recusado com a mensagem no campo.

O token fica no `expo-secure-store` (armazenamento criptografado do celular);
se a API responder 401, o app limpa a sessão e volta para o login sozinho.

## Câmera e galeria

No formulário da nota fiscal, os botões **📷 Câmera** e **🖼 Galeria** usam
`expo-image-picker`. As permissões são pedidas em tempo de execução e
declaradas no `app.json` (`cameraPermission` / `photosPermission`).

## Testes

```bash
npm test              # 31 testes de unidade (Vitest): schemas, FormData, URLs, erros
npm run typecheck     # validação de tipos (tsc --noEmit)
```

Cobertura completa e checklist manual: [`../docs/TESTES.md`](../docs/TESTES.md).

## Decisões técnicas relevantes

- **Upload de foto em `update`**: PHP não faz o parsing de `multipart/form-data`
  em requisições `PUT`. Por isso, ao editar uma nota com nova foto, o app
  envia um `POST` com o campo `_method=PUT` (method spoofing nativo do
  Laravel) em vez de um `PUT` real com arquivo.
- **URL da foto**: a API monta a URL com `APP_URL` (localhost); o
  `services/mediaUrl.ts` reconstrói a URL com a origem real da API para
  abrir no celular/emulador (testado no `mediaUrl.test.ts`).
- **Delete fica numa tela de confirmação própria** (`NotaFiscalDeleteScreen`),
  não reaproveita a lista inteira — evita o bug de "tela de delete que é só
  uma cópia da lista e nunca chama a API" visto no material de aula.
- **Nomes de campo idênticos à API** (`valor_total`, `forma_pagamento`,
  etc.) para evitar o mismatch `preco` x `preco_venda` identificado antes.
- **Erros do servidor por campo**: o 422 do Laravel é convertido em
  `setError()` do react-hook-form (`utils/apiErrors.ts`), mostrando a mensagem
  embaixo do campo certo.
