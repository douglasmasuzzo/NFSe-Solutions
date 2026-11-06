import * as SecureStore from 'expo-secure-store';

/**
 * Armazenamento do token de autenticação (Sanctum).
 *
 * - No iOS/Android, `expo-secure-store` usa o keychain/keystore.
 * - Na web, `sessionStorage` mantém a sessão até a aba ser fechada. O navegador
 *   não oferece a mesma proteção criptográfica do armazenamento nativo.
 * - Mantemos também uma cópia em memória (`memoryToken`) porque o
 *   interceptor do axios precisa ler o token de forma SÍNCRONA; o SecureStore
 *   só é assíncrono. A memória é a fonte síncrona para o interceptor.
 */
const TOKEN_KEY = 'nfse_auth_token';

let memoryToken: string | null = null;

function getBrowserSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage;
}

/** Leitura síncrona (para o interceptor do axios). */
export function getToken(): string | null {
  return memoryToken;
}

/** Carrega o token salvo na abertura do app. */
export async function loadToken(): Promise<string | null> {
  if (memoryToken !== null) return memoryToken;
  const browserStorage = getBrowserSessionStorage();
  if (browserStorage) {
    memoryToken = browserStorage.getItem(TOKEN_KEY);
    return memoryToken;
  }

  try {
    memoryToken = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    memoryToken = null;
  }
  return memoryToken;
}

export async function saveToken(token: string): Promise<void> {
  const browserStorage = getBrowserSessionStorage();
  if (browserStorage) {
    browserStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
  memoryToken = token;
}

export async function clearToken(): Promise<void> {
  memoryToken = null;
  const browserStorage = getBrowserSessionStorage();
  if (browserStorage) {
    browserStorage.removeItem(TOKEN_KEY);
    return;
  }

  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // Já removido ou indisponível — seguimos com a memória limpa.
  }
}
