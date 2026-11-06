import { beforeEach, describe, expect, it, vi } from 'vitest';

const secureStore = vi.hoisted(() => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

vi.mock('expo-secure-store', () => secureStore);

import * as SecureStore from 'expo-secure-store';
import { clearToken, getToken, loadToken, saveToken } from './tokenStorage';

const TOKEN_KEY = 'nfse_auth_token';

function createSessionStorage() {
  const values = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
    removeItem: vi.fn((key: string) => values.delete(key)),
  };
}

describe('tokenStorage', () => {
  beforeEach(async () => {
    await clearToken();
    vi.clearAllMocks();
    vi.stubGlobal('window', undefined);
  });

  it('usa sessionStorage na web para salvar, restaurar e remover o token', async () => {
    const browserStorage = createSessionStorage();
    vi.stubGlobal('window', { sessionStorage: browserStorage });

    await saveToken('web-token');
    expect(browserStorage.setItem).toHaveBeenCalledWith(TOKEN_KEY, 'web-token');
    expect(getToken()).toBe('web-token');
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();

    await clearToken();
    expect(browserStorage.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(getToken()).toBeNull();
  });

  it('restaura token existente da sessão do navegador', async () => {
    const browserStorage = createSessionStorage();
    browserStorage.setItem(TOKEN_KEY, 'existing-token');
    vi.stubGlobal('window', { sessionStorage: browserStorage });

    expect(await loadToken()).toBe('existing-token');
    expect(getToken()).toBe('existing-token');
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
  });

  it('continua usando SecureStore em plataformas nativas', async () => {
    vi.mocked(SecureStore.setItemAsync).mockResolvedValue(undefined);
    vi.mocked(SecureStore.getItemAsync).mockResolvedValue('native-token');

    await saveToken('native-token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(TOKEN_KEY, 'native-token');
    await clearToken();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(TOKEN_KEY);
  });
});
