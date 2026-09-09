<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notas_fiscais', function (Blueprint $table) {
            $table->id();

            $table->foreignId('fornecedor_id')
                ->constrained('fornecedores')
                ->onDelete('cascade');

            $table->string('numero');
            $table->date('dt_emissao');
            $table->string('imagem_nf')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notas_fiscais');
    }
};