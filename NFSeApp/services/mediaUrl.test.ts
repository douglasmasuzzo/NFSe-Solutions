import { describe, expect, it } from 'vitest';
import { API_ORIGIN, resolveMediaUrl } from './mediaUrl';

describe('resolveMediaUrl', () => {
  it('retorna null quando não há URL', () => {
    expect(resolveMediaUrl(null)).toBeNull();
    expect(resolveMediaUrl(undefined)).toBeNull();
    expect(resolveMediaUrl('')).toBeNull();
  });

  it('rema a URL da foto para a origem real da API (APP_URL=localhost não serve no celular)', () => {
    const vindaDaApi = 'http://localhost:8000/storage/notas-fiscais/foto.jpg';

    expect(resolveMediaUrl(vindaDaApi)).toBe(
      `${API_ORIGIN}/storage/notas-fiscais/foto.jpg`
    );
  });

  it('funciona com APP_URL usando IP ou domínio diferentes', () => {
    expect(resolveMediaUrl('http://127.0.0.1:8000/storage/a.png')).toBe(
      `${API_ORIGIN}/storage/a.png`
    );
    expect(resolveMediaUrl('https://exemplo.com.br/storage/b.jpg')).toBe(
      `${API_ORIGIN}/storage/b.jpg`
    );
  });

  it('devolve a URL original quando não é arquivo de storage', () => {
    const externa = 'https://cdn.example.com/imagem.jpg';
    expect(resolveMediaUrl(externa)).toBe(externa);
  });

  it('mantém subpastas após /storage/', () => {
    expect(resolveMediaUrl('http://localhost:8000/storage/notas-fiscais/sub/p.jpg')).toBe(
      `${API_ORIGIN}/storage/notas-fiscais/sub/p.jpg`
    );
  });
});
