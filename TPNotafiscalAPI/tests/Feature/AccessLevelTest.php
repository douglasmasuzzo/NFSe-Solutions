<?php

namespace Tests\Feature;

use App\Models\Fornecedor;
use App\Models\NotaF;
use App\Models\Produto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Testes do NÍVEL DE ACESSO (roles):
 *  - 'admin' pode listar, cadastrar, editar e excluir;
 *  - 'user'  pode listar, cadastrar e editar, mas exclusão devolve 403;
 *  - cadastro novo nasce sempre como 'user' (não se auto-promove a admin).
 */
class AccessLevelTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role): User
    {
        return User::factory()->create(['role' => $role]);
    }

    private function makeNota(): NotaF
    {
        $fornecedor = Fornecedor::create([
            'nome' => 'Fornecedor Nível LTDA',
            'cnpj' => '55.666.777/0001-88',
        ]);

        return NotaF::create([
            'fornecedor_id' => $fornecedor->id,
            'numero' => '000777',
            'dt_emissao' => '2026-11-11',
            'valor_total' => 10.0,
            'forma_pagamento' => 'Pix',
        ]);
    }

    // -------------------------------------------------------------------------
    // O papel vem junto no login e no cadastro
    // -------------------------------------------------------------------------

    public function test_login_returns_the_user_role(): void
    {
        $admin = $this->makeUser('admin');

        $this->postJson('/api/login', [
            'email' => $admin->email,
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonPath('user.role', 'admin');
    }

    public function test_register_creates_user_with_lowest_role(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Novo Aluno',
            'email' => 'novo-nivel@fatec.pg',
            'password' => 'senha1234',
            'password_confirmation' => 'senha1234',
        ]);

        // Nasce com o nível mais baixo: não existe auto-promoção a admin
        $response
            ->assertStatus(201)
            ->assertJsonPath('user.role', 'user');

        $this->assertDatabaseHas('users', [
            'email' => 'novo-nivel@fatec.pg',
            'role' => 'user',
        ]);
    }

    // -------------------------------------------------------------------------
    // Nível comum: pode consultar/cadastrar/editar, mas NÃO pode excluir
    // -------------------------------------------------------------------------

    public function test_common_user_can_list_notes(): void
    {
        Sanctum::actingAs($this->makeUser('user'));
        $this->makeNota();

        $this->getJson('/api/notas-fiscais')->assertOk();
    }

    public function test_common_user_can_create_note(): void
    {
        Sanctum::actingAs($this->makeUser('user'));
        $fornecedor = Fornecedor::create(['nome' => 'Criar LTDA', 'cnpj' => '12.121.212/0001-31']);

        $this->postJson('/api/notas-fiscais', [
            'fornecedor_id' => $fornecedor->id,
            'numero' => '000888',
            'dt_emissao' => '2026-11-11',
            'valor_total' => 20.0,
            'forma_pagamento' => 'Dinheiro',
        ])->assertStatus(201);
    }

    public function test_common_user_cannot_delete_note(): void
    {
        Sanctum::actingAs($this->makeUser('user'));
        $nota = $this->makeNota();

        $this->deleteJson("/api/notas-fiscais/{$nota->id}")
            ->assertStatus(403)
            ->assertJsonPath('message', 'Acesso negado: seu nível de acesso não permite esta ação.');

        // A nota continua no banco — a negação não apagou nada
        $this->assertDatabaseHas('notas_fiscais', ['id' => $nota->id]);
    }

    public function test_common_user_cannot_delete_supplier_or_product(): void
    {
        Sanctum::actingAs($this->makeUser('user'));
        $fornecedor = Fornecedor::create(['nome' => 'Protegido LTDA', 'cnpj' => '98.765.432/0001-10']);
        $produto = Produto::create(['nome' => 'Item Protegido', 'preco_venda' => 5.0]);

        $this->deleteJson("/api/fornecedores/{$fornecedor->id}")->assertStatus(403);
        $this->deleteJson("/api/produtos/{$produto->id}")->assertStatus(403);

        $this->assertDatabaseHas('fornecedores', ['id' => $fornecedor->id]);
        $this->assertDatabaseHas('produtos', ['id' => $produto->id]);
    }

    // -------------------------------------------------------------------------
    // Nível admin: exclusão liberada
    // -------------------------------------------------------------------------

    public function test_admin_can_delete_note(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));
        $nota = $this->makeNota();

        $this->deleteJson("/api/notas-fiscais/{$nota->id}")->assertStatus(204);

        $this->assertDatabaseMissing('notas_fiscais', ['id' => $nota->id]);
    }

    public function test_admin_can_delete_supplier(): void
    {
        Sanctum::actingAs($this->makeUser('admin'));
        $fornecedor = Fornecedor::create(['nome' => 'Apagável LTDA', 'cnpj' => '11.222.333/0001-99']);

        $this->deleteJson("/api/fornecedores/{$fornecedor->id}")->assertStatus(204);
    }

    // -------------------------------------------------------------------------
    // Sem token a exclusão continua bloqueada (401 antes do 403)
    // -------------------------------------------------------------------------

    public function test_delete_without_token_is_still_unauthorized(): void
    {
        $nota = $this->makeNota();

        $this->deleteJson("/api/notas-fiscais/{$nota->id}")->assertStatus(401);
    }
}
