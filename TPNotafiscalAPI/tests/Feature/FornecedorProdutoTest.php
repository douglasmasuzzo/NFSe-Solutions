<?php

namespace Tests\Feature;

use App\Models\Fornecedor;
use App\Models\Produto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** Testes de CRUD dos recursos auxiliares: Fornecedores e Produtos. */
class FornecedorProdutoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Sanctum::actingAs(User::factory()->create());
    }

    public function test_fornecedor_crud_flow(): void
    {
        // Create
        $response = $this->postJson('/api/fornecedores', [
            'nome' => 'Comercial Paulista LTDA',
            'cnpj' => '34.567.890/0001-03',
        ]);
        $response->assertStatus(201)->assertJsonPath('nome', 'Comercial Paulista LTDA');
        $id = $response->json('id');

        // Read
        $this->getJson('/api/fornecedores')->assertOk()->assertJsonCount(1);

        // Update
        $this->putJson("/api/fornecedores/{$id}", ['nome' => 'Comercial Paulista Ltda.'])
            ->assertOk()
            ->assertJsonPath('nome', 'Comercial Paulista Ltda.');

        // Delete
        $this->deleteJson("/api/fornecedores/{$id}")->assertStatus(204);
        $this->assertDatabaseMissing('fornecedores', ['id' => $id]);
    }

    public function test_fornecedor_rejects_duplicated_cnpj(): void
    {
        Fornecedor::create(['nome' => 'A', 'cnpj' => '11.111.111/0001-11']);

        $this->postJson('/api/fornecedores', ['nome' => 'B', 'cnpj' => '11.111.111/0001-11'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('cnpj');
    }

    public function test_fornecedor_requires_name_and_cnpj(): void
    {
        $this->postJson('/api/fornecedores', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['nome', 'cnpj']);
    }

    public function test_produto_crud_flow(): void
    {
        $response = $this->postJson('/api/produtos', [
            'nome' => 'Arroz 5kg',
            'preco_venda' => 29.9,
        ]);
        $response->assertStatus(201);
        $id = $response->json('id');

        $this->getJson('/api/produtos')->assertOk()->assertJsonCount(1);

        $this->putJson("/api/produtos/{$id}", ['preco_venda' => 32.5])
            ->assertOk()
            ->assertJsonPath('preco_venda', 32.5);

        $this->deleteJson("/api/produtos/{$id}")->assertStatus(204);
        $this->assertDatabaseMissing('produtos', ['id' => $id]);
    }

    public function test_produto_rejects_negative_price(): void
    {
        $this->postJson('/api/produtos', ['nome' => 'X', 'preco_venda' => -1])
            ->assertStatus(422)
            ->assertJsonValidationErrors('preco_venda');
    }

    public function test_produto_requires_name_and_price(): void
    {
        $this->postJson('/api/produtos', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['nome', 'preco_venda']);
    }
}
