import { NotaFiscalFormValues } from '../types/NotaFiscalSchema';

/**
 * Monta o FormData multipart enviado para a API. A foto é opcional: quando
 * `imageUri` não é informado (ex.: edição sem trocar a imagem), o campo
 * simplesmente não é anexado e o backend mantém a imagem já existente.
 *
 * Os itens da nota são anexados no formato `produtos[0][produto_id]`, que o
 * PHP interpreta como um array associativo (produtos[] de objetos).
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

  (values.produtos ?? []).forEach((item, index) => {
    form.append(`produtos[${index}][produto_id]`, String(item.produto_id));
    form.append(`produtos[${index}][quantidade]`, String(item.quantidade));
    form.append(`produtos[${index}][preco_compra]`, String(item.preco_compra));
  });

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
