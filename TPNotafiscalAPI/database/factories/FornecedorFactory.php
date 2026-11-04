<?php

namespace Database\Factories;

use App\Models\Fornecedor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Fornecedor>
 */
class FornecedorFactory extends Factory
{
    protected $model = Fornecedor::class;

    public function definition(): array
    {
        return [
            'nome' => fake()->unique()->company(),
            'cnpj' => fake()->unique()->numerify('##.###.###/0001-##'),
        ];
    }
}
