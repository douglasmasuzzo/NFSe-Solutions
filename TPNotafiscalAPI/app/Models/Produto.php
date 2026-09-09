<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;


class Produto extends Model
{
    protected $fillable = [
        'nome',
        'preco_venda',
    ];

    /**
     * Um produto pode aparecer em várias notas fiscais.
     */
    public function notasFiscais(): BelongsToMany
    {
        return $this->belongsToMany(
            NotaF::class,
            'nota_fiscal_produtos',
            'produto_id',
            'nota_fiscal_id'
        )->withPivot([
            'quantidade',
            'preco_compra',
        ])->withTimestamps();
    }
}
