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

    // Cria o token de acesso (Sanctum) e devolve junto os dados do usuário,
    // incluindo o nível de acesso (role) para o app saber o que exibir.
    return response()->json([
        'token' => $user->createToken($request->email)->plainTextToken,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
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

    // Nível de acesso nasce como 'user' (default da coluna): um cadastro novo
    // nunca se auto-promote a admin — quem cria conta entra com permissão mínima.
    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => $request->password,
    ]);

    // O 'role' vem do DEFAULT do banco, então o modelo em memória ainda não o
    // tem: recarrega para devolver o papel real no JSON.
    $user->refresh();

    return response()->json([
        'token' => $user->createToken($request->email)->plainTextToken,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
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
        ->parameters(['notas-fiscais' => 'nota'])
        ->except(['destroy']);
    Route::apiResource('fornecedores', FornecedorController::class)
        ->parameters(['fornecedores' => 'fornecedor'])
        ->except(['destroy']);
    Route::apiResource('produtos', ProdutoController::class)->except(['destroy']);

    // ------------------------------------------------------------------
    // NÍVEL DE ACESSO (roles): exclusão exige papel 'admin'.
    // Qualquer usuário autenticado pode listar/cadastrar/editar; apagar
    // registros devolve 403 para quem tem papel 'user'.
    // ------------------------------------------------------------------
    Route::delete('/notas-fiscais/{nota}', [NotaFController::class, 'destroy'])
        ->middleware('role:admin')
        ->name('notas-fiscais.destroy');
    Route::delete('/fornecedores/{fornecedor}', [FornecedorController::class, 'destroy'])
        ->middleware('role:admin')
        ->name('fornecedores.destroy');
    Route::delete('/produtos/{produto}', [ProdutoController::class, 'destroy'])
        ->middleware('role:admin')
        ->name('produtos.destroy');
});
