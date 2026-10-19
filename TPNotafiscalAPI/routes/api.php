<?php

use App\Http\Controllers\FornecedorController;
use App\Http\Controllers\NotaFController;
use App\Http\Controllers\ProdutoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('notas-fiscais', NotaFController::class);
Route::apiResource('fornecedores', FornecedorController::class);
Route::apiResource('produtos', ProdutoController::class);
