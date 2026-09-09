<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('nota_f_s', function (Blueprint $table) {
            $table->id();
            $table->integer('idProduto');
            $table->date('dtEmissao');
            $table->integer('qtdProduto');
            $table->string('nomeProduto');
            $table->decimal('precoProduto', 14,2);
            $table->string('imagemNF');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nota_f_s');
    }
};
