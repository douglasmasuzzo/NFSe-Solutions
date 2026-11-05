import Constants from 'expo-constants';

// Configuração base da API + utilitários de URL.
// Separado de api.ts para poder ser importado pelos schemas Zod e pelos
// testes sem depender do axios nem do expo-secure-store.

const FALLBACK_API_BASE_URL = 'http://192.168.0.10:8000/api';
const API_PORT = 8000;

/**
 * Usa a URL configurada explicitamente quando disponível; caso contrário,
 * reutiliza o host do servidor Expo na rede local para acessar o Laravel.
 */
export function resolveApiBaseUrl(
  apiUrlOverride = process.env.EXPO_PUBLIC_API_URL,
  expoHostUri: string | null | undefined = Constants.expoConfig?.hostUri
): string {
  const configuredUrl = apiUrlOverride?.trim();
  if (configuredUrl) return configuredUrl;
  if (!expoHostUri) return FALLBACK_API_BASE_URL;

  const hostUri = expoHostUri.includes('://')
    ? expoHostUri
    : `http://${expoHostUri}`;
  const { hostname } = new URL(hostUri);

  return `http://${hostname}:${API_PORT}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();

/** Origem do servidor (protocolo + host + porta), sem o "/api". */
export const API_ORIGIN = new URL(API_BASE_URL).origin;

/**
 * Converte a URL da foto vinda da API em uma URL utilizável no celular.
 *
 * A API monta a URL a partir de APP_URL (ex.: http://localhost:8000), que é
 * válido só na própria máquina. Aqui extraímos apenas o caminho "/storage/..."
 * e o montamos de novo com a origem real da API (o IP da rede local), então a
 * foto abre igualmente no emulador, no celular e no navegador.
 */
export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;

  const marker = '/storage/';
  const index = url.indexOf(marker);
  if (index === -1) return url;

  return API_ORIGIN + url.slice(index);
}
