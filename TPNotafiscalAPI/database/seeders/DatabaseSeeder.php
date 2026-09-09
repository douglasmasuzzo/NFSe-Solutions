<?php

namespace Database\Seeders;

use App\Models\Fornecedor;
use App\Models\NotaF;
use App\Models\Produto;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Usuário de teste
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // ==========================================
        // FORNECEDORES
        // ==========================================

        $fornecedor1 = Fornecedor::create([
            'nome' => 'Distribuidora Brasil LTDA',
            'cnpj' => '12.345.678/0001-01',
        ]);

        $fornecedor2 = Fornecedor::create([
            'nome' => 'Atacado São Paulo LTDA',
            'cnpj' => '23.456.789/0001-02',
        ]);

        $fornecedor3 = Fornecedor::create([
            'nome' => 'Comercial Paulista LTDA',
            'cnpj' => '34.567.890/0001-03',
        ]);

        // ==========================================
        // PRODUTOS
        // ==========================================

        $cocaCola = Produto::create([
            'nome' => 'Coca-Cola 2L',
            'preco_venda' => 9.99,
        ]);

        $arroz = Produto::create([
            'nome' => 'Arroz 5kg',
            'preco_venda' => 29.90,
        ]);

        $feijao = Produto::create([
            'nome' => 'Feijão 1kg',
            'preco_venda' => 8.99,
        ]);

        $oleo = Produto::create([
            'nome' => 'Óleo de Soja 900ml',
            'preco_venda' => 7.49,
        ]);

        $macarrao = Produto::create([
            'nome' => 'Macarrão 500g',
            'preco_venda' => 5.99,
        ]);

        // ==========================================
        // NOTA FISCAL 1
        // ==========================================

        $nota1 = NotaF::create([
            'fornecedor_id' => $fornecedor1->id,
            'numero' => '000001',
            'dt_emissao' => '2026-09-01',
            'imagem_nf' => null,
        ]);

        $nota1->produtos()->attach($cocaCola->id, [
            'quantidade' => 20,
            'preco_compra' => 6.50,
        ]);

        $nota1->produtos()->attach($arroz->id, [
            'quantidade' => 30,
            'preco_compra' => 21.90,
        ]);

        // ==========================================
        // NOTA FISCAL 2
        // ==========================================

        $nota2 = NotaF::create([
            'fornecedor_id' => $fornecedor2->id,
            'numero' => '000002',
            'dt_emissao' => '2026-09-02',
            'imagem_nf' => null,
        ]);

        $nota2->produtos()->attach($feijao->id, [
            'quantidade' => 40,
            'preco_compra' => 6.20,
        ]);

        $nota2->produtos()->attach($oleo->id, [
            'quantidade' => 50,
            'preco_compra' => 5.30,
        ]);

        // ==========================================
        // NOTA FISCAL 3
        // ==========================================

        $nota3 = NotaF::create([
            'fornecedor_id' => $fornecedor3->id,
            'numero' => '000003',
            'dt_emissao' => '2026-09-03',
            'imagem_nf' => null,
        ]);

        $nota3->produtos()->attach($macarrao->id, [
            'quantidade' => 60,
            'preco_compra' => 4.10,
        ]);

        $nota3->produtos()->attach($arroz->id, [
            'quantidade' => 20,
            'preco_compra' => 22.50,
        ]);

        // ==========================================
        // NOTA FISCAL 4
        // ==========================================

        $nota4 = NotaF::create([
            'fornecedor_id' => $fornecedor1->id,
            'numero' => '000004',
            'dt_emissao' => '2026-09-05',
            'imagem_nf' => null,
        ]);

        $nota4->produtos()->attach($cocaCola->id, [
            'quantidade' => 35,
            'preco_compra' => 6.70,
        ]);

        $nota4->produtos()->attach($feijao->id, [
            'quantidade' => 25,
            'preco_compra' => 6.40,
        ]);

        // ==========================================
        // NOTA FISCAL 5
        // ==========================================

        $nota5 = NotaF::create([
            'fornecedor_id' => $fornecedor2->id,
            'numero' => '000005',
            'dt_emissao' => '2026-09-07',
            'imagem_nf' => null,
        ]);

        $nota5->produtos()->attach($oleo->id, [
            'quantidade' => 45,
            'preco_compra' => 5.45,
        ]);

        $nota5->produtos()->attach($macarrao->id, [
            'quantidade' => 50,
            'preco_compra' => 4.25,
        ]);
    }
}