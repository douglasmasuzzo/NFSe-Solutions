<?php

namespace App\Http\Controllers;

use App\Models\Fornecedor;
use Illuminate\Http\Request;

class FornecedorController extends Controller
{
    public function index()
    {
        return response()->json(Fornecedor::orderBy('nome')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome' => ['required', 'string', 'max:150'],
            'cnpj' => ['required', 'string', 'max:20', 'unique:fornecedores,cnpj'],
        ]);

        return response()->json(Fornecedor::create($data), 201);
    }

    public function show(Fornecedor $fornecedor)
    {
        return response()->json($fornecedor);
    }

    public function update(Request $request, Fornecedor $fornecedor)
    {
        $data = $request->validate([
            'nome' => ['sometimes', 'required', 'string', 'max:150'],
            'cnpj' => ['sometimes', 'required', 'string', 'max:20', 'unique:fornecedores,cnpj,' . $fornecedor->id],
        ]);

        $fornecedor->update($data);

        return response()->json($fornecedor);
    }

    public function destroy(Fornecedor $fornecedor)
    {
        $fornecedor->delete();

        return response()->json(null, 204);
    }
}
