# Análise estrutural e plano de melhorias — NFSe Solutions

> Documento técnico de apoio à apresentação (`docs/APRESENTACAO.md`).
> Data da análise: 04/11/2026 — revisão direta do código-fonte do repositório.
> **Atualização: itens P0-1, P0-2, P0-3, P1-1 a P1-5 e P2-3 concluídos**
> (autenticação, câmera, paginação, URL de mídia, itens no formulário,
> erros por campo e 78 testes automatizados — ver `TESTES.md`).

---

## 1. Inventário do que existe hoje

### 1.1 Backend — `TPNotafiscalAPI/` (Laravel 13, PHP 8.3, SQLite)

| Camada | Arquivos | Situação |
|---|---|---|
| Rotas | `routes/api.php` (login/register/logout + 3 `apiResource` + `/user`) | ✅ funcional, ✅ **protegidas por `auth:sanctum`** |
| Controllers | `NotaF`, `Fornecedor`, `Produto` | ✅ CRUD completo, validação inline, upload e sync de itens |
| Models | `NotaF`, `Fornecedor`, `Produto`, `User` | ✅ relacionamentos, accessor `imagem_nf_url` e `HasApiTokens` |
| Migrations | 8 arquivos (users, cache, jobs, tokens, 4 de negócio) | ✅ modelo relacional íntegro (FK + cascade) |
| Seeder | `DatabaseSeeder` | ✅ 3 fornecedores, 5 produtos, 5 notas + **usuário de teste** (`test@example.com`/`password`, senha bcrypt) |
| Storage | `storage/app/public/` | ⚠️ exige `php artisan storage:link` (documentado no README) |
| Testes | `tests/Feature/{AuthTest,NotaFiscalCrudTest,FornecedorProdutoTest}` | ✅ **30 testes, 30 passando** (PHPUnit + SQLite em memória) |
| README | `TPNotafiscalAPI/README.md` | ✅ criado (setup, rotas, login, testes) |

**Endpoints operacionais:** 18 rotas (3 de autenticação + 15 REST) com
paginação (15/página), filtro por `fornecedor_id`, validação de imagem
(jpg/jpeg/png, até 5 MB), persistência em `multipart` e **token em todas as
rotas de recurso**.

> **Bug corrigido (crítico):** o singularizador do Laravel gerava os parâmetros
> `{notas-fiscai}` e `{fornecedore}` (regra de plural em inglês), que não
> casavam com os nomes dos parâmetros dos controllers — o *implicit binding*
> era descartado em silêncio e `show`/`update`/`destroy` recebiam modelos
> vazios (nunca atualizavam nem excluíam nada). Corrigido com
> `->parameters(['notas-fiscais' => 'nota', 'fornecedores' => 'fornecedor'])`.

### 1.2 Frontend — `NFSeApp/` (Expo SDK 57, React Native 0.86, TypeScript strict)

| Camada | Arquivos | Situação |
|---|---|---|
| Rotas (`app/`) | `_layout`, `login`, `index`, `notas-fiscais/{index,new,[id]/edit,[id]/delete}` | ✅ rotas finas, modal no delete, **`RequireAuth` em toda rota protegida** |
| Autenticação | `features/auth/` (AuthContext, useLogin/useRegister/useLogout, LoginScreen, RegisterScreen, tokenStorage) | ✅ token no `expo-secure-store` + interceptor axios + 401 automático |
| Telas (`screens/`) | List, Create, Edit, Delete | ✅ loading/erro/vazio/retry tratados |
| Hooks (7+1) | React Query (notas, fornecedores, produtos, login, logout) | ✅ `useInfiniteQuery` na lista + invalidação de cache |
| Componentes | `NotaFiscalForm` (compartilhado), `NotaFiscalCard` | ✅ DRY entre criação e edição |
| Contratos | `NotaFiscalSchema.ts` (zod: entrada/saída, itens) | ✅ espelha o Model Laravel |
| Utilitários | `toFormData.ts`, `apiErrors.ts`, `mediaUrl.ts` | ✅ multipart, erros 422 por campo, URL da foto corrigida |
| Infra | `services/api.ts` (axios, Bearer + 401, timeout 10 s), `constants/Theme.ts` | ✅ |
| Imagem | `expo-image-picker` (**câmera + galeria**, quality 0.7, edição 4:3) | ✅ permissão de câmera no `app.json` |
| Testes/tipos | Vitest (`npm test`), tsc (`npm run typecheck`) | ✅ **31 testes passando, 0 erros de tipo** |

### 1.3 Fluxo central (foto → dado persistido)

`RequireAuth` confere a sessão → `NotaFiscalForm` → `pickFromCamera()` ou
`pickFromGallery()` → `zod` valida → `toFormData()` →
`api.post('/notas-fiscais', multipart + Bearer)` → `NotaFController@store`
valida → `Storage::disk('public')->store()` → `NotaF::create()` +
`sync(produtos)` → 201 → React Query invalida `['notas-fiscais']`.

---

## 2. Diagnóstico: o projeto atende ao objetivo declarado?

O objetivo é **reconhecer informações de notas fiscais a partir da captura da
imagem**. Hoje o projeto entrega:

- ✅ **captura/seleção da imagem** (**câmera** e galeria)
- ✅ **armazenamento e exibição** da imagem (URL corrigida para o IP da API)
- ❌ **reconhecimento (OCR) da imagem** — inexistente. Nenhuma dependência de
  OCR/vision no `package.json` ou `composer.json`, nenhum endpoint, nenhum
  código de extração. Os campos são 100 % digitados.

**Conclusão: a parte central do objetivo ainda não foi implementada.** O CRUD
(Etapa 1), a interface (Etapa 2), a **autenticação**, a **câmera** e os
**testes** estão concluídos; o reconhecimento é a lacuna principal.

---

## 3. Lista de problemas identificados (por prioridade)

### 🔴 P0 — bugs ou lacunas que comprometem a demonstração

| # | Problema | Status |
|---|---|---|
| P0-1 | **Lista truncada em 15 registros** — hoje usa `useInfiniteQuery` com botão "Carregar mais" | ✅ **concluído** |
| P0-2 | **URL da foto pode não abrir no celular** — `resolveMediaUrl()` reconstrói a URL com o IP da API (testado no Vitest) | ✅ **concluído** |
| P0-3 | **Sem câmera** — agora `launchCameraAsync` + permissão `cameraPermission` no `app.json` (botões "Câmera" e "Galeria") | ✅ **concluído** |
| P0-4 | **Sem OCR/reconhecimento** — busca por `ocr\|reconhe\|vision\|mlkit` = 0 resultados | ❌ pendente (Fase B) |

### 🟠 P1 — qualidade, segurança e completude

| # | Problema | Status |
|---|---|---|
| P1-1 | **API totalmente aberta** — agora todos os `apiResource` estão no grupo `auth:sanctum` (login/register/logout + 13 testes de auth) | ✅ **concluído** |
| P1-2 | **Erros de validação (422) viram Alert genérico** — `extractValidationErrors()` mapeia para `setError()` campo a campo | ✅ **concluído** |
| P1-3 | **Itens da nota não existem no app** — `useFieldArray` + chips de produto + soma dos itens no formulário | ✅ **concluído** |
| P1-4 | **Sem testes automatizados** — 25 PHPUnit + 23 Vitest + 14 de integração (ver `TESTES.md`) | ✅ **concluído** |
| P1-5 | **`README` do backend inexistente** — criado `TPNotafiscalAPI/README.md` | ✅ **concluído** |
| P1-6 | **Sem tratamento de timeout offline** (10 s fixos) | ⏳ pendente |

### 🟡 P2 — melhorias de maturidade

| # | Problema | Status |
|---|---|---|
| P2-1 | Validação no backend inline no controller (sem `FormRequest`) | ⏳ pendente |
| P2-2 | Sem ESLint/Prettier no app e sem CI | ⏳ pendente |
| P2-3 | Sem paginação na UI — agora `useInfiniteQuery` + "Carregar mais" | ✅ **concluído** |
| P2-4 | `valor_total` aceita valor divergente da soma dos itens (sem regra de negócio) — hoje só **exibe** a soma | ⏳ pendente |
| P2-5 | Nome "NFSe" remete a Nota Fiscal de **Serviços** Eletrônica, mas o modelo é de **produtos** — convém alinhar o texto apresentado | ⏳ pendente |
| P2-6 | README raiz com campo de integrantes incompleto ("Moises ...") | ⏳ pendente (grupo) |
| P2-7 | Sem identificadores Android/iOS no `app.json` — necessário para build | ⏳ pendente |

---

## 4. Plano de melhorias (roadmap sugerido)

### Fase A — Estabilizar (antes da apresentação, 1–2 dias) — ✅ CONCLUÍDA

1. **P0-1:** ✅ paginação incremental com `useInfiniteQuery` + "Carregar mais".
2. **P0-2:** ✅ `resolveMediaUrl()` no app + documentação de `storage:link`.
3. **P0-3:** ✅ `launchCameraAsync` + permissão de câmera no `app.json`.
4. **P1-5:** ✅ `TPNotafiscalAPI/README.md` criado.
5. **P2-6:** ⏳ completar os integrantes no README raiz (ação do grupo).

### Fase B — Reconhecimento (módulo central, 1 semana) — ⏳ PRÓXIMA

1. Endpoint `POST /api/notas-fiscais/reconhecer` (aceita a foto, devolve
   `numero`, `dt_emissao`, `valor_total`, `cnpj_fornecedor`, `itens[]` com
   grau de confiança).
2. Motor de OCR — decisão:
   - **Google Cloud Vision** (recomendado para prazo: integração simples no
     Laravel, boa precisão em NF brasileira);
   - **ML Kit on-device** (grátis/offline, exige dev client Expo);
   - **Tesseract self-hosted** (grátis, mais trabalho de pré-processamento).
3. No app: novo hook `useReconhecerNota` → tela de **confirmação** com campos
   pré-preenchidos → usuário corrige → salva (fluxo "assistido", nunca
   automático).

### Fase C — Endurecer (pós-apresentação) — ✅ CONCLUÍDA (itens 1–4)

1. **P1-1:** ✅ autenticação Sanctum (login + token no axios interceptor).
2. **P1-2:** ✅ erro 422 do Laravel mapeado para `setError()` do RHF.
3. **P1-3:** ✅ formulário de itens (produto, quantidade, preço) + soma
   exibida.
4. **P1-4:** ✅ testes feature do Laravel (25) + testes de unidade do app (23)
   + integração (14).
5. **P2-1/P2-2:** ⏳ `FormRequest`, ESLint/Prettier e CI (GitHub Actions).

---

## 5. Matriz resumo (o que dizer em uma frase)

| Área | Nota | Frase para a apresentação |
|---|---|---|
| Arquitetura | 🟢 boa | "Duas camadas bem separadas, padrão REST + feature-based." |
| Modelo de dados | 🟢 bom | "4 tabelas, relacionamentos N:N e integridade referencial." |
| Validação | 🟢 boa | "Dupla validação: zod no app, Laravel no servidor, erros por campo." |
| UI/UX | 🟢 boa | "Estados completos, tema consistente, delete em modal." |
| Upload de foto | 🟢 bom | "Câmera e galeria, URL corrigida para o dispositivo, troca com limpeza da antiga." |
| Autenticação | 🟢 boa | "Sanctum + token no SecureStore + guarda de rotas + 401 automático." |
| Testes | 🟢 boa | "78 verificações automatizadas (30 backend + 31 app + 17 integração)." |
| Reconhecimento | 🔴 ausente | "É o próximo módulo — opções de OCR já mapeadas." |
