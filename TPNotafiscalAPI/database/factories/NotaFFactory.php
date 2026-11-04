<?php

namespace Database\Factories;

use App\Models\Fornecedor;
use App\Models\NotaF;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NotaF>
 */
class NotaFFactory extends Factory
{
    protected $model = NotaF::class;

    public function definition(): array
    {
        return [
            'fornecedor_id' => Fornecedor::factory(),
            'numero' => fake()->unique()->numerify('######'),
            'dt_emissao' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'valor_total' => fake()->randomFloat(2, 10, 2000),
            'forma_pagamento' => fake()->randomElement(
                ['Boleto', 'Pix', 'Transferência', 'Dinheiro', 'Cartão']
            ),
            'observacoes' => fake()->sentence(),
            'imagem_nf' => null,
        ];
    }
}
