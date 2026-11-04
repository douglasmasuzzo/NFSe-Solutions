import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Testes de unidade do app (Vitest + Node, sem emulador).
// Cobrem a lógica pura: schemas Zod, montagem do FormData, URLs de mídia e
// mapeamento de erros da API. A UI é validada manualmente (ver docs/TESTES.md).
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**'],
  },
});
