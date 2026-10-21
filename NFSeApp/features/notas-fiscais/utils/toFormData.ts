import { NotaFiscalFormValues } from '../types/NotaFiscalSchema';

/**
 * Monta o FormData multipart enviado para a API. A foto é opcional: quando
 * `imageUri` não é informado (ex.: edição sem trocar a imagem), o campo
 * simplesmente não é anexado e o backend mantém a imagem já existente.
 */
export function toFormData(values: NotaFiscalFormValues, imageUri?: string | null): FormData {
  const form = new FormData();

  form.append('fornecedor_id', String(values.fornecedor_id));
  form.append('numero', values.numero);
  form.append('dt_emissao', values.dt_emissao);
  form.append('valor_total', String(values.valor_total));
  form.append('forma_pagamento', values.forma_pagamento);

  if (values.observacoes) {
    form.append('observacoes', values.observacoes);
  }

  if (imageUri) {
    const fileName = imageUri.split('/').pop() ?? 'nota.jpg';
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

    // Formato exigido pelo React Native para enviar arquivos via FormData.
    form.append('imagem_nf', {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);
  }

  return form;
}
