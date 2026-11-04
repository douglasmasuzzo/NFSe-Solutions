import * as SecureStore from 'expo-secure-store';

/**
 * Armazenamento do token de autenticação (Sanctum).
 *
 * - `expo-secure-store` guarda de forma criptografada no keychain/keystore.
 * - Mantemos também uma cópia em memória (`memoryToken`) porque o
 *   interceptor do axios precisa ler o token de forma SÍNCRONA; o SecureStore
 *   só é assíncrono. A memória é sempre a fonte "rápida", o SecureStore é a
 *   persistência entre aberturas do app.
 */
const TOKEN_KEY = 'nfse_auth_token';

let memoryToken: string | null = null;

/** Leitura síncrona (para o interceptor do axios). */
export function getToken(): string | null {
  return memoryToken;
}

/** Carrega o token salvo na abertura do app. */
export async function loadToken(): Promise<string | null> {
  if (memoryToken !== null) return memoryToken;
  try {
    memoryToken = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    memoryToken = null;
  }
  return memoryToken;
}

export async function saveToken(token: string): Promise<void> {
  memoryToken = token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  memoryToken = null;
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // Já removido ou indisponível — seguimos com a memória limpa.
  }
}
