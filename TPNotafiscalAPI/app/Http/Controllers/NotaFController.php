<?php

namespace App\Http\Controllers;

use App\Models\NotaF;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class NotaFController extends Controller
{
    private function rules(bool $isUpdate = false): array
    {
        return [
            'fornecedor_id' => ['required', 'integer', 'exists:fornecedores,id'],
            'numero' => ['required', 'string', 'max:50'],
            'dt_emissao' => ['required', 'date'],
            'valor_total' => ['required', 'numeric', 'min:0'],
            'forma_pagamento' => ['required', 'string', 'max:50'],
            'observacoes' => ['nullable', 'string'],
            'imagem_nf' => [$isUpdate ? 'sometimes' : 'nullable', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
            'produtos' => ['sometimes', 'array'],
            'produtos.*.produto_id' => ['required_with:produtos', 'integer', 'exists:produtos,id'],
            'produtos.*.quantidade' => ['required_with:produtos', 'integer', 'min:1'],
            'produtos.*.preco_compra' => ['required_with:produtos', 'numeric', 'min:0'],
        ];
    }

    public function index(Request $request)
    {
        $query = NotaF::with(['fornecedor', 'produtos']);

        if ($request->filled('fornecedor_id')) {
            $query->where('fornecedor_id', $request->integer('fornecedor_id'));
        }

        return response()->json(
            $query->orderByDesc('dt_emissao')->paginate($request->integer('per_page', 15))
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());

        if ($request->hasFile('imagem_nf')) {
            $data['imagem_nf'] = $request->file('imagem_nf')->store('notas-fiscais', 'public');
        }

        $notaFiscal = NotaF::create(collect($data)->except('produtos')->toArray());

        if (!empty($data['produtos'])) {
            $notaFiscal->produtos()->sync(
                collect($data['produtos'])->mapWithKeys(fn ($item) => [
                    $item['produto_id'] => [
                        'quantidade' => $item['quantidade'],
                        'preco_compra' => $item['preco_compra'],
                    ],
                ])
            );
        }

        return response()->json($notaFiscal->load(['fornecedor', 'produtos']), 201);
    }

    public function show(NotaF $notaF)
    {
        return response()->json($notaF->load(['fornecedor', 'produtos']));
    }

    public function update(Request $request, NotaF $notaF)
    {
        $data = $request->validate($this->rules(isUpdate: true));

        if ($request->hasFile('imagem_nf')) {
            if ($notaF->imagem_nf) {
                Storage::disk('public')->delete($notaF->imagem_nf);
            }
            $data['imagem_nf'] = $request->file('imagem_nf')->store('notas-fiscais', 'public');
        }

        $notaF->update(collect($data)->except('produtos')->toArray());

        if (array_key_exists('produtos', $data)) {
            $notaF->produtos()->sync(
                collect($data['produtos'])->mapWithKeys(fn ($item) => [
                    $item['produto_id'] => [
                        'quantidade' => $item['quantidade'],
                        'preco_compra' => $item['preco_compra'],
                    ],
                ])
            );
        }

        return response()->json($notaF->load(['fornecedor', 'produtos']));
    }

    public function destroy(NotaF $notaF)
    {
        if ($notaF->imagem_nf) {
            Storage::disk('public')->delete($notaF->imagem_nf);
        }

        $notaF->produtos()->detach();
        $notaF->delete();

        return response()->json(null, 204);
    }
}
