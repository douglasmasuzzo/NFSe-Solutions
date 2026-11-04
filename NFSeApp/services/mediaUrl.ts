// Configuração base da API + utilitários de URL.
// Separado de api.ts para poder ser importado pelos schemas Zod e pelos
// testes sem depender do axios nem do expo-secure-store.

// IMPORTANTE: nunca usar "localhost" aqui — num dispositivo físico ou no
// emulador, "localhost" aponta para o próprio aparelho, não para a máquina
// que está rodando `php artisan serve`. Configure EXPO_PUBLIC_API_URL no
// arquivo .env com o IP da sua máquina na rede local (veja .env.example).
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.10:8000/api';

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
