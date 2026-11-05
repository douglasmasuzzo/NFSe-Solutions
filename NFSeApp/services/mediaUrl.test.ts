import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-constants', () => ({
  default: { expoConfig: { hostUri: '192.168.12.98:8081' } },
}));

import { API_ORIGIN, resolveApiBaseUrl, resolveMediaUrl } from './mediaUrl';

describe('resolveApiBaseUrl', () => {
  it('usa o host local do Expo na porta da API', () => {
    expect(resolveApiBaseUrl(undefined, '192.168.12.98:8081')).toBe(
      'http://192.168.12.98:8000/api'
    );
  });

  it('aceita hostUri com protocolo', () => {
    expect(resolveApiBaseUrl(undefined, 'https://192.168.12.98:8081')).toBe(
      'http://192.168.12.98:8000/api'
    );
  });

  it('prioriza a URL explícita para servidor remoto ou túnel', () => {
    expect(
      resolveApiBaseUrl(
        'https://api.exemplo.com/api',
        '192.168.12.98:8081'
      )
    ).toBe('https://api.exemplo.com/api');
  });

  it('mantém a URL padrão se o Expo não fornecer um host', () => {
    expect(resolveApiBaseUrl(undefined, null)).toBe(
      'http://192.168.0.10:8000/api'
    );
  });
});

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
