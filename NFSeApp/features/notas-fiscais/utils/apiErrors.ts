import { isAxiosError } from 'axios';

/**
 * Extrai os erros de validação do Laravel (422 → { errors: { campo: [msg] } })
 * no formato usado pelo `setError` do react-hook-form, permitindo exibir a
 * mensagem embaixo do campo certo em vez de um Alert genérico.
 *
 * Retorna um objeto vazio quando a falha não é de validação (rede, 500...).
 */
export function extractValidationErrors(error: unknown): Record<string, string> {
  if (!isAxiosError(error)) return {};

  const errors = error.response?.data?.errors as
    | Record<string, string | string[]>
    | undefined;

  if (!errors || typeof errors !== 'object') return {};

  const result: Record<string, string> = {};
  for (const [field, messages] of Object.entries(errors)) {
    result[field] = Array.isArray(messages) ? (messages[0] ?? '') : String(messages);
  }
  return result;
}
