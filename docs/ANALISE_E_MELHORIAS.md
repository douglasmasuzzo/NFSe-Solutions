# Análise estrutural e plano de melhorias — NFSe Solutions

> Documento técnico de apoio à apresentação (`docs/APRESENTACAO.md`).
> Data da análise: 04/11/2026 — revisão direta do código-fonte do repositório.

---

## 1. Inventário do que existe hoje

### 1.1 Backend — `TPNotafiscalAPI/` (Laravel 13, PHP 8.3, SQLite)

| Camada | Arquivos | Situação |
|---|---|---|
| Rotas | `routes/api.php` (3 `apiResource` + `/user`) | ✅ funcional, ⚠️ sem autenticação |
| Controllers | `NotaF`, `Fornecedor`, `Produto` | ✅ CRUD completo, validação inline, upload e sync de itens |
| Models | `NotaF`, `Fornecedor`, `Produto`, `User` | ✅ relacionamentos e accessor `imagem_nf_url` corretos |
| Migrations | 8 arquivos (users, cache, jobs, tokens, 4 de negócio) | ✅ modelo relacional íntegro (FK + cascade) |
| Seeder | `DatabaseSeeder` | ✅ 3 fornecedores, 5 produtos, 5 notas com itens |
| Storage | `storage/app/public/` | ⚠️ vazio; exige `php artisan storage:link` |
| Testes | `tests/Feature/ExampleTest` | ❌ apenas exemplo padrão do Laravel |
| README | — | ❌ inexistente (o README raiz promete um em cada pasta) |

**Endpoints operacionais:** 15 rotas REST (notas-fiscais, fornecedores,
produtos) com paginação (15/página), filtro por `fornecedor_id`, validação de
imagem (jpg/jpeg/png, até 5 MB) e persistência em `multipart`.

### 1.2 Frontend — `NFSeApp/` (Expo SDK 57, React Native 0.86, TypeScript strict)

| Camada | Arquivos | Situação |
|---|---|---|
| Rotas (`app/`) | `_layout`, `index`, `notas-fiscais/{index,new,[id]/edit,[id]/delete}` | ✅ rotas finas, modal no delete |
| Telas (`screens/`) | List, Create, Edit, Delete | ✅ loading/erro/vazio/retry tratados |
| Hooks (6) | `useNotasFiscais`, `useNotaFiscal`, `useCreate`, `useUpdate`, `useDelete`, `useFornecedores` | ✅ React Query com invalidação de cache |
| Componentes | `NotaFiscalForm` (compartilhado), `NotaFiscalCard` | ✅ DRY entre criação e edição |
| Contratos | `NotaFiscalSchema.ts` (zod: entrada/saída) | ✅ espelha o Model Laravel |
| Utilitários | `toFormData.ts` | ✅ formato multipart do RN |
| Infra | `services/api.ts` (axios, timeout 10 s), `constants/Theme.ts` | ✅ |
| Imagem | `expo-image-picker` (só galeria, quality 0.7, edição 4:3) | ⚠️ sem câmera |
| Testes/lint | — | ❌ nenhum |

### 1.3 Fluxo central (foto → dado persistido)

`NotaFiscalForm` → `pickImage()` (galeria) → `zod` valida → `toFormData()` →
`api.post('/notas-fiscais', multipart)` → `NotaFController@store` valida →
`Storage::disk('public')->store()` → `NotaF::create()` + `sync(produtos)` →
201 → React Query invalida `['notas-fiscais']`.

---

## 2. Diagnóstico: o projeto atende ao objetivo declarado?

O objetivo é **reconhecer informações de notas fiscais a partir da captura da
imagem**. Hoje o projeto entrega:

- ✅ **captura/seleção da imagem** (parcial: só galeria, não câmera)
- ✅ **armazenamento e exibição** da imagem
- ❌ **reconhecimento (OCR) da imagem** — inexistente. Nenhuma dependência de
  OCR/vision no `package.json` ou `composer.json`, nenhum endpoint, nenhum
  código de extração. Os campos são 100 % digitados.

**Conclusão: a parte central do objetivo ainda não foi implementada.** O CRUD é
a base necessária (Etapa 1 e 2 concluídas), mas o reconhecimento é a lacuna
principal.

---

## 3. Lista de problemas identificados (por prioridade)

### 🔴 P0 — bugs ou lacunas que comprometem a demonstração

| # | Problema | Evidência | Efeito prático |
|---|---|---|---|
| P0-1 | **Lista truncada em 15 registros** — `useNotasFiscais` lê só `.data` da primeira página, sem `page`/`per_page` | `hooks/useNotasFiscais.ts` × `NotaFController@index` (`paginate(15)`) | Notas a partir da 16ª nunca aparecem |
| P0-2 | **URL da foto pode não abrir no celular** — `Storage::url()` usa `APP_URL` (ex.: `http://localhost:8000`) e `storage/app/public` está vazio (sem `storage:link`) | `NotaF.php::getImagemNfUrlAttribute` | Miniaturas "Sem foto"/quebradas em dispositivo físico |
| P0-3 | **Sem câmera** — só `launchImageLibraryAsync`; `app.json` não declara permissão de câmera | `NotaFiscalForm.tsx::pickImage` | Não atende "captura a imagem da nota" |
| P0-4 | **Sem OCR/reconhecimento** | busca por `ocr|reconhe|vision|mlkit` = 0 resultados | Objetivo central do projeto ausente |

### 🟠 P1 — qualidade, segurança e completude

| # | Problema | Evidência |
|---|---|---|
| P1-1 | **API totalmente aberta** — nenhum `apiResource` tem middleware; Sanctum só na rota `/user` | `routes/api.php` |
| P1-2 | **Erros de validação (422) viram Alert genérico** — os campos do formulário não são preenchidos com os erros do servidor | `NotaFiscalCreateScreen` / `EditScreen` |
| P1-3 | **Itens da nota não existem no app** — backend aceita `produtos[]`, o form não envia; `valor_total` não é conferido com a soma dos itens | `toFormData.ts` |
| P1-4 | **Sem testes automatizados** (backend só `ExampleTest`; app nenhum) | `tests/` |
| P1-5 | **`README` do backend inexistente** — o README raiz manda "ver o README de cada pasta" | raiz do repositório |
| P1-6 | **Sem tratamento de erro por campo nem de timeout offline** no envio de imagem (10 s fixos) | `services/api.ts` |

### 🟡 P2 — melhorias de maturidade

| # | Problema |
|---|---|
| P2-1 | Validação no backend inline no controller (sem `FormRequest`) |
| P2-2 | Sem ESLint/Prettier no app e sem CI (o Pint do Laravel existe mas não é executado em pipeline) |
| P2-3 | Sem paginação/infinite scroll na UI (relacionado ao P0-1) |
| P2-4 | `valor_total` aceita valor divergente da soma dos itens (sem regra de negócio) |
| P2-5 | Nome "NFSe" remete a Nota Fiscal de **Serviços** Eletrônica, mas o modelo é de **produtos** — convém alinhar o texto apresentado |
| P2-6 | README raiz com campo de integrantes incompleto ("Moises ...") |
| P2-7 | Sem identificadores Android/iOS (`android.package`/`ios.bundleIdentifier`) no `app.json` — necessário para build |

---

## 4. Plano de melhorias (roadmap sugerido)

### Fase A — Estabilizar (antes da apresentação, 1–2 dias)

1. **P0-1:** buscar todas as páginas no hook (`?per_page=100` ou paginação
   incremental com `useInfiniteQuery`).
2. **P0-2:** rodar `php artisan storage:link`, documentar `APP_URL` com o IP da
   LAN no `.env.example` e comentar no README.
3. **P0-3:** adicionar `launchCameraAsync` + permissão `cameraPermission` no
   `app.json` (botões "Câmera" e "Galeria").
4. **P1-5:** criar `TPNotafiscalAPI/README.md` (setup, rotas, seed, storage).
5. **P2-6:** completar os integrantes no README raiz.

### Fase B — Reconhecimento (módulo central, 1 semana)

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

### Fase C — Endurecer (pós-apresentação)

1. **P1-1:** autenticação Sanctum (login + token no axios interceptor).
2. **P1-2:** mapear erro 422 do Laravel para `setError()` do react-hook-form.
3. **P1-3:** formulário de itens (produto, quantidade, preço) + soma
   automática do `valor_total`.
4. **P1-4:** testes feature do Laravel (CRUD + upload) e testes dos hooks com
   Vitest.
5. **P2-1/P2-2:** `FormRequest`, ESLint/Prettier e CI (GitHub Actions).

---

## 5. Matriz resumo (o que dizer em uma frase)

| Área | Nota | Frase para a apresentação |
|---|---|---|
| Arquitetura | 🟢 boa | "Duas camadas bem separadas, padrão REST + feature-based." |
| Modelo de dados | 🟢 bom | "4 tabelas, relacionamentos N:N e integridade referencial." |
| Validação | 🟢 boa | "Dupla validação: zod no app, Laravel no servidor." |
| UI/UX | 🟢 boa | "Estados completos, tema consistente, delete em modal." |
| Upload de foto | 🟡 parcial | "Funciona, mas falta câmera e configuração de URL." |
| Reconhecimento | 🔴 ausente | "É o próximo módulo — opções de OCR já mapeadas." |
| Segurança | 🔴 ausente | "API aberta; Sanctum instalado, falta ativar." |
| Testes | 🔴 ausente | "Só exemplos padrão; entra no roadmap." |
