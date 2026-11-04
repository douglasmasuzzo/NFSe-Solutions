<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Testes do processo de autenticação por token (Sanctum).
 *
 * Fluxo coberto:
 *  - POST /api/login       → devolve token + dados do usuário
 *  - rotas protegidas      → exigem "Authorization: Bearer <token>"
 *  - POST /api/logout      → revoga o token usado
 */
class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(): User
    {
        return User::factory()->create([
            'email' => 'aluno@fatec.pg',
            'password' => 'senha123',
        ]);
    }

    public function test_login_returns_token_and_user_data(): void
    {
        $this->makeUser();

        $response = $this->postJson('/api/login', [
            'email' => 'aluno@fatec.pg',
            'password' => 'senha123',
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']])
            ->assertJsonPath('user.email', 'aluno@fatec.pg');
    }

    public function test_login_rejects_wrong_password(): void
    {
        $this->makeUser();

        $this->postJson('/api/login', [
            'email' => 'aluno@fatec.pg',
            'password' => 'senha-errada',
        ])
            ->assertStatus(422)
            ->assertJson(['error' => 'Credenciais inválidas.']);
    }

    public function test_login_rejects_unknown_email(): void
    {
        $this->postJson('/api/login', [
            'email' => 'naoexiste@fatec.pg',
            'password' => 'senha123',
        ])
            ->assertStatus(422)
            ->assertJson(['error' => 'Credenciais inválidas.']);
    }

    public function test_login_validates_required_fields(): void
    {
        $this->postJson('/api/login', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_api_resources_are_rejected_without_token(): void
    {
        $this->getJson('/api/notas-fiscais')->assertStatus(401);
        $this->postJson('/api/notas-fiscais', [])->assertStatus(401);
        $this->getJson('/api/fornecedores')->assertStatus(401);
        $this->getJson('/api/produtos')->assertStatus(401);
    }

    public function test_api_resources_accept_valid_token(): void
    {
        Sanctum::actingAs($this->makeUser());

        $this->getJson('/api/notas-fiscais')->assertOk();
        $this->getJson('/api/fornecedores')->assertOk();
        $this->getJson('/api/produtos')->assertOk();
    }

    public function test_user_route_returns_authenticated_user(): void
    {
        $user = $this->makeUser();

        $this->withToken($user->createToken('app')->plainTextToken)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('email', 'aluno@fatec.pg');
    }

    public function test_logout_revokes_the_current_token(): void
    {
        $user = $this->makeUser();
        $token = $user->createToken('app')->plainTextToken;

        $this->withToken($token)->postJson('/api/logout')
            ->assertOk()
            ->assertJson(['message' => 'Logout realizado com sucesso']);

        // Limpa o cache de guards do AuthManager: em produção cada requisição
        // nasce "limpa" (PHP-FPM), e aqui simulamos o mesmo ciclo.
        auth()->forgetGuards();

        // Token revogado não pode mais acessar a API
        $this->withToken($token)->getJson('/api/notas-fiscais')->assertStatus(401);
    }

    // -------------------------------------------------------------------------
    // Cadastro (POST /api/register)
    // -------------------------------------------------------------------------

    public function test_register_creates_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Aluno Novo',
            'email' => 'novo@fatec.pg',
            'password' => 'senha1234',
            'password_confirmation' => 'senha1234',
        ]);

        $response
            ->assertStatus(201)
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']])
            ->assertJsonPath('user.email', 'novo@fatec.pg');

        $this->assertDatabaseHas('users', ['email' => 'novo@fatec.pg']);

        // A senha gravada é o HASH, nunca o texto puro
        $user = User::where('email', 'novo@fatec.pg')->first();
        $this->assertTrue(Hash::check('senha1234', $user->password));
        $this->assertNotSame('senha1234', $user->password);
    }

    public function test_register_allows_login_right_after_creating_account(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Fluxo Completo',
            'email' => 'fluxo@fatec.pg',
            'password' => 'senha1234',
            'password_confirmation' => 'senha1234',
        ])->assertStatus(201);

        $this->postJson('/api/login', [
            'email' => 'fluxo@fatec.pg',
            'password' => 'senha1234',
        ])
            ->assertOk()
            ->assertJsonStructure(['token', 'user']);
    }

    public function test_register_rejects_duplicated_email(): void
    {
        $this->makeUser(); // aluno@fatec.pg já existe

        $this->postJson('/api/register', [
            'name' => 'Outro Aluno',
            'email' => 'aluno@fatec.pg',
            'password' => 'senha1234',
            'password_confirmation' => 'senha1234',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_register_validates_required_fields(): void
    {
        $this->postJson('/api/register', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_register_rejects_short_password_and_mismatched_confirmation(): void
    {
        // Senha curta (menos de 8 caracteres)
        $this->postJson('/api/register', [
            'name' => 'Curta',
            'email' => 'curta@fatec.pg',
            'password' => '1234',
            'password_confirmation' => '1234',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('password');

        // Confirmação diferente da senha
        $this->postJson('/api/register', [
            'name' => 'Diferente',
            'email' => 'diferente@fatec.pg',
            'password' => 'senha1234',
            'password_confirmation' => 'senha9999',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }
}
