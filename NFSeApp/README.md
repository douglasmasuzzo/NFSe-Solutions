# NFSeApp

App Expo (React Native + TypeScript) para o CRUD de Notas Fiscais, consumindo
a API Laravel em `../TPNotafiscalAPI`.

## Bibliotecas exigidas pela disciplina

- `react-hook-form` — gerenciamento do formulário
- `zod` — validação e contrato de dados (`features/notas-fiscais/types/NotaFiscalSchema.ts`)
- `@hookform/resolvers` — integração RHF + Zod
- `axios` — cliente HTTP (`services/api.ts`)
- `@tanstack/react-query` — cache e sincronização de dados do servidor

## Estrutura (padrão "Features")

```
features/notas-fiscais/
  types/     → contratos Zod (entrada do form x saída da API)
  hooks/     → React Query (useNotasFiscais, useCreateNotaFiscal, ...)
  components/→ NotaFiscalForm (compartilhado criação/edição), NotaFiscalCard
  screens/   → telas completas (List, Create, Edit, Delete)
app/         → rotas do Expo Router, finas, só delegam para as screens
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

## Decisões técnicas relevantes

- **Upload de foto em `update`**: PHP não faz o parsing de `multipart/form-data`
  em requisições `PUT`. Por isso, ao editar uma nota com nova foto, o app
  envia um `POST` com o campo `_method=PUT` (method spoofing nativo do
  Laravel) em vez de um `PUT` real com arquivo.
- **Delete fica numa tela de confirmação própria** (`NotaFiscalDeleteScreen`),
  não reaproveita a lista inteira — evita o bug de "tela de delete que é só
  uma cópia da lista e nunca chama a API" visto no material de aula.
- **Nomes de campo idênticos à API** (`valor_total`, `forma_pagamento`,
  etc.) para evitar o mismatch `preco` x `preco_venda` identificado antes.
