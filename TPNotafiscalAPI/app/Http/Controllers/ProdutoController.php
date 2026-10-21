<?php

namespace App\Http\Controllers;

use App\Models\Produto;
use Illuminate\Http\Request;

class ProdutoController extends Controller
{
    public function index()
    {
        return response()->json(Produto::orderBy('nome')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome' => ['required', 'string', 'max:150'],
            'preco_venda' => ['required', 'numeric', 'min:0'],
        ]);

        return response()->json(Produto::create($data), 201);
    }

    public function show(Produto $produto)
    {
        return response()->json($produto);
    }

    public function update(Request $request, Produto $produto)
    {
        $data = $request->validate([
            'nome' => ['sometimes', 'required', 'string', 'max:150'],
            'preco_venda' => ['sometimes', 'required', 'numeric', 'min:0'],
        ]);

        $produto->update($data);

        return response()->json($produto);
    }

    public function destroy(Produto $produto)
    {
        $produto->delete();

        return response()->json(null, 204);
    }
}
