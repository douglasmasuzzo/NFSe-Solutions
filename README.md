# NFSe Solutions

Projeto da disciplina de Dispositivos Móveis (FATEC Praia Grande).

- **`TPNotafiscalAPI/`** — Backend: API REST em Laravel com autenticação por
  token (Sanctum) e testes automatizados (Etapa 1).
- **`NFSeApp/`** — Frontend: app Expo com login, CRUD completo de Nota Fiscal
  (câmera/galeria, itens de produtos, paginação) usando react-hook-form, zod,
  @hookform/resolvers, axios e @tanstack/react-query, estruturado em
  `features/` (Etapa 2).

Veja o README de cada pasta para instruções de setup.

## Acesso de teste

```
e-mail: test@example.com
senha:  password
```

(Criado pelo seeder: `php artisan db:seed` no backend. Também dá para
**criar uma conta nova** pelo app, na tela "Criar conta".)

## Documentação

- [`docs/APRESENTACAO.md`](docs/APRESENTACAO.md) — roteiro de apresentação com
  diagramas (arquitetura, autenticação, modelo de dados, fluxo da foto) e
  respostas prontas para perguntas.
- [`docs/ANALISE_E_MELHORIAS.md`](docs/ANALISE_E_MELHORIAS.md) — análise da
  estrutura atual, problemas identificados e roadmap de melhorias.
- [`docs/TESTES.md`](docs/TESTES.md) — seção de testes: cobertura dos 62
  testes automatizados (backend + app + integração) e checklist manual de
  demonstração.

## Testes

```bash
# Backend (30 testes)
cd TPNotafiscalAPI && php artisan test

# Frontend (31 testes + validação de tipos)
cd NFSeApp && npm test && npm run typecheck
```

## Integrantes
_(preencher com os nomes do grupo)_
- _Moises Santana (Representante)_
- _Tiago Felipe (Colaborador Auxiliar)_
- _Douglas Masuzzo (Colaborador Auxiliar)_