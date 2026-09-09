<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; 
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class NotaF extends Model
{
    protected $table = 'notas_fiscais';

    protected $fillable = [
        'fornecedor_id',
        'numero',
        'dt_emissao',
        'imagem_nf',
    ];

    /**
     * Uma nota fiscal pertence a um fornecedor.
     */
    public function fornecedor(): BelongsTo
    {
        return $this->belongsTo(Fornecedor::class);
    }

    /**
     * Uma nota fiscal possui vários produtos.
     */
    public function produtos(): BelongsToMany
    {
        return $this->belongsToMany(
            Produto::class,
            'nota_fiscal_produtos',
            'nota_fiscal_id',
            'produto_id'
        )->withPivot([
            'quantidade',
            'preco_compra',
        ])->withTimestamps();
    }
}