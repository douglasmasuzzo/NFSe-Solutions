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
        'valor_total',
        'forma_pagamento',
        'observacoes',
        'imagem_nf',
    ];

    protected $casts = [
        'dt_emissao' => 'date',
        'valor_total' => 'decimal:2',
    ];

    protected $appends = [
        'imagem_nf_url',
    ];

    public function getImagemNfUrlAttribute(): ?string
    {
        return $this->imagem_nf
            ? \Illuminate\Support\Facades\Storage::disk('public')->url($this->imagem_nf)
            : null;
    }

    public function fornecedor(): BelongsTo
    {
        return $this->belongsTo(Fornecedor::class);
    }

    public function produtos(): BelongsToMany
    {
        return $this->belongsToMany(
            Produto::class,
            'nota_fiscal_produtos',
            'nota_fiscal_id',
            'produto_id'
        )->withPivot(['quantidade', 'preco_compra'])->withTimestamps();
    }
}
