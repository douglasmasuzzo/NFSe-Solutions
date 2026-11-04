<?php

namespace Tests\Feature;

use App\Models\Fornecedor;
use App\Models\NotaF;
use App\Models\Produto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Testes de ponta a ponta do CRUD de Notas Fiscais
 * (validação, vínculo de produtos e upload de foto).
 */
class NotaFiscalCrudTest extends TestCase
{
    use RefreshDatabase;

    private Fornecedor $fornecedor;
    private Produto $produto;

    protected function setUp(): void
    {
        parent::setUp();

        Sanctum::actingAs(User::factory()->create());

        $this->fornecedor = Fornecedor::create([
            'nome' => 'Distribuidora Brasil LTDA',
            'cnpj' => '12.345.678/0001-01',
        ]);

        $this->produto = Produto::create([
            'nome' => 'Coca-Cola 2L',
            'preco_venda' => 9.99,
        ]);
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'fornecedor_id' => $this->fornecedor->id,
            'numero' => '000123',
            'dt_emissao' => '2026-10-13',
            'valor_total' => 150.5,
            'forma_pagamento' => 'Pix',
            'observacoes' => 'Teste',
        ], $overrides);
    }

    public function test_index_returns_paginated_notes(): void
    {
        NotaF::factory()->count(3)->create(['fornecedor_id' => $this->fornecedor->id]);

        $response = $this->getJson('/api/notas-fiscais')->assertOk();

        $this->assertCount(3, $response->json('data'));
        $response->assertJsonStructure(['data', 'current_page', 'last_page']);
        $response->assertJsonPath('data.0.fornecedor.nome', 'Distribuidora Brasil LTDA');
    }

    public function test_index_can_filter_by_supplier(): void
    {
        $outro = Fornecedor::create(['nome' => 'Outro LTDA', 'cnpj' => '99.999.999/0001-99']);
        NotaF::factory()->create(['fornecedor_id' => $this->fornecedor->id]);
        NotaF::factory()->create(['fornecedor_id' => $outro->id]);

        $response = $this->getJson("/api/notas-fiscais?fornecedor_id={$this->fornecedor->id}")
            ->assertOk();

        $this->assertCount(1, $response->json('data'));
        $this->assertEquals($this->fornecedor->id, $response->json('data.0.fornecedor_id'));
    }

    public function test_store_creates_note_with_linked_products(): void
    {
        $payload = $this->validPayload([
            'produtos' => [
                ['produto_id' => $this->produto->id, 'quantidade' => 10, 'preco_compra' => 6.5],
            ],
        ]);

        $response = $this->postJson('/api/notas-fiscais', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('numero', '000123')
            ->assertJsonPath('produtos.0.pivot.quantidade', 10)
            ->assertJsonPath('produtos.0.pivot.preco_compra', 6.5);

        $this->assertDatabaseHas('notas_fiscais', ['numero' => '000123']);
    }

    public function test_store_rejects_invalid_data(): void
    {
        $this->postJson('/api/notas-fiscais', ['numero' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'fornecedor_id',
                'numero',
                'dt_emissao',
                'valor_total',
                'forma_pagamento',
            ]);
    }

    public function test_store_rejects_nonexistent_supplier(): void
    {
        $this->postJson('/api/notas-fiscais', $this->validPayload(['fornecedor_id' => 9999]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('fornecedor_id');
    }

    public function test_store_saves_the_note_photo(): void
    {
        Storage::fake('public');

        $response = $this->post('/api/notas-fiscais', $this->validPayload() + [
            'imagem_nf' => UploadedFile::fake()->image('nota.jpg', 800, 600),
        ], ['Accept' => 'application/json']);

        $response->assertStatus(201);
        Storage::disk('public')->assertExists($response->json('imagem_nf'));
        $this->assertStringStartsWith('notas-fiscais/', $response->json('imagem_nf'));
    }

    public function test_update_changes_fields(): void
    {
        $nota = NotaF::create($this->validPayload());

        $this->putJson("/api/notas-fiscais/{$nota->id}", [
            'fornecedor_id' => $this->fornecedor->id,
            'numero' => '999888',
            'dt_emissao' => '2026-11-01',
            'valor_total' => 99.9,
            'forma_pagamento' => 'Boleto',
        ])
            ->assertOk()
            ->assertJsonPath('numero', '999888');

        $this->assertDatabaseHas('notas_fiscais', ['id' => $nota->id, 'numero' => '999888']);
    }

    public function test_update_replaces_photo_and_deletes_the_old_one(): void
    {
        Storage::fake('public');
        $antiga = UploadedFile::fake()->image('antiga.jpg')->store('notas-fiscais', 'public');

        $nota = NotaF::create($this->validPayload(['imagem_nf' => $antiga]));

        // Atualização com foto nova usa POST + _method=PUT (method spoofing),
        // que é o formato enviado pelo app para suportar multipart.
        $this->post("/api/notas-fiscais/{$nota->id}", [
            '_method' => 'PUT',
            'fornecedor_id' => $this->fornecedor->id,
            'numero' => $nota->numero,
            'dt_emissao' => '2026-10-13',
            'valor_total' => $nota->valor_total,
            'forma_pagamento' => $nota->forma_pagamento,
            'imagem_nf' => UploadedFile::fake()->image('nova.jpg'),
        ], ['Accept' => 'application/json'])->assertOk();

        Storage::disk('public')->assertMissing($antiga);
        $this->assertNotEquals($antiga, $nota->fresh()->imagem_nf);
        Storage::disk('public')->assertExists($nota->fresh()->imagem_nf);
    }

    public function test_destroy_removes_note_photo_and_items(): void
    {
        Storage::fake('public');

        $foto = UploadedFile::fake()->image('nota.jpg')->store('notas-fiscais', 'public');
        $nota = NotaF::create($this->validPayload(['imagem_nf' => $foto]));
        $nota->produtos()->attach($this->produto->id, [
            'quantidade' => 2,
            'preco_compra' => 5.0,
        ]);

        $this->deleteJson("/api/notas-fiscais/{$nota->id}")->assertStatus(204);

        $this->assertDatabaseMissing('notas_fiscais', ['id' => $nota->id]);
        $this->assertDatabaseMissing('nota_fiscal_produtos', ['nota_fiscal_id' => $nota->id]);
        Storage::disk('public')->assertMissing($foto);
    }
}
