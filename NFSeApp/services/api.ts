import axios from 'axios';
import { clearToken, getToken } from '@/features/auth/utils/tokenStorage';
import { API_BASE_URL } from './mediaUrl';

type UnauthorizedHandler = () => void | Promise<void>;

let unauthorizedHandler: UnauthorizedHandler | null = null;

/**
 * Registra o callback chamado quando a API responde 401 (token expirado ou
 * revogado). O AuthProvider usa isso para encerrar a sessão e voltar ao
 * login. Desregistra no cleanup do effect.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// Anexa o token Sanctum em TODA requisição (exceto o próprio login).
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se a API recusar o token, limpa a sessão local e avisa o AuthProvider.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearToken();
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

export default api;
