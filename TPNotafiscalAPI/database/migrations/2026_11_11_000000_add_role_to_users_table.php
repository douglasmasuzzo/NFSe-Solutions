<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Níveis de acesso do sistema:
     *  - 'admin': pode consultar, cadastrar, editar E excluir
     *  - 'user' : pode consultar, cadastrar e editar (exclusão → 403)
     *
     * O valor 'user' vem do default da coluna, então cadastros novos sempre
     * nascem com o nível mais baixo — só um admin pode promover alguém.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('user')->after('password');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
