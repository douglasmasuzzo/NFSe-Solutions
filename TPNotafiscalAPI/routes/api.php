<?php

use App\Http\Controllers\FornecedorController;
use App\Http\Controllers\NotaFController;
use App\Http\Controllers\ProdutoController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;

// =========================================================================
// Autenticação por token (Laravel Sanctum)
// Fluxo: POST /login -> token -> enviado como "Authorization: Bearer <token>"
//        em todas as demais requisições -> POST /logout revoga o token.
// =========================================================================

Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required'],
    ]);

    // Busca o usuário pelo e-mail
    $user = User::where('email', $request->email)->first();

    // Compara a senha enviada com a senha criptografada do banco
    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['error' => 'Credenciais inválidas.'], 422);
    }

    // Cria o token de acesso (Sanctum) e devolve junto os dados do usuário
    return response()->json([
        'token' => $user->createToken($request->email)->plainTextToken,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ],
    ]);
});

// Cadastro de novo usuário: cria a conta (senha criptografada pelo cast
// 'hashed' do model) e já devolve o token, logando o usuário na hora.
Route::post('/register', function (Request $request) {
    $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'max:255', 'unique:users,email'],
        'password' => ['required', 'string', 'min:8', 'confirmed'],
    ], [
        'name.required' => 'Informe seu nome.',
        'email.required' => 'Informe o e-mail.',
        'email.email' => 'Use um e-mail válido.',
        'email.unique' => 'Este e-mail já está cadastrado.',
        'password.required' => 'Informe a senha.',
        'password.min' => 'A senha deve ter pelo menos 8 caracteres.',
        'password.confirmed' => 'A confirmação de senha não confere.',
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => $request->password,
    ]);

    return response()->json([
        'token' => $user->createToken($request->email)->plainTextToken,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ],
    ], 201);
});

Route::middleware('auth:sanctum')->post('/logout', function (Request $request) {
    // Revoga somente o token usado nesta requisição
    $request->user()->currentAccessToken()->delete();

    return response()->json(['message' => 'Logout realizado com sucesso']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// =========================================================================
// Recursos protegidos: toda a API exige token válido
// =========================================================================

Route::middleware('auth:sanctum')->group(function () {
    // ->parameters() fixa o nome do parâmetro na rota para que ele case com o
    // nome do parâmetro do controller. Sem isso, o singularizador do Laravel
    // (regra de plural em inglês) gera "{notas-fiscai}" e "{fornecedore}",
    // o binding implícito não encontra o parâmetro e o controller recebe um
    // model vazio (nunca atualiza nem exclui nada).
    Route::apiResource('notas-fiscais', NotaFController::class)
        ->parameters(['notas-fiscais' => 'nota']);
    Route::apiResource('fornecedores', FornecedorController::class)
        ->parameters(['fornecedores' => 'fornecedor']);
    Route::apiResource('produtos', ProdutoController::class);
});
