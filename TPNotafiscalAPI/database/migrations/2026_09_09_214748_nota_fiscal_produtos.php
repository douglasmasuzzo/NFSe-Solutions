<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nota_fiscal_produtos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('nota_fiscal_id')
                ->constrained('notas_fiscais')
                ->onDelete('cascade');

            $table->foreignId('produto_id')
                ->constrained('produtos')
                ->onDelete('cascade');

            $table->unsignedInteger('quantidade');

            // Preço que a loja pagou ao fornecedor
            $table->decimal('preco_compra', 14, 2);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nota_fiscal_produtos');
    }
};