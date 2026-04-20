<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'item_name',
        'item_condition',
        'item_gender',
        'recommended_age',
        'item_brand',
        'item_material',
        'item_season',
        'item_quantity',
        'item_sizes',
        'item_colors',
    ];

    protected $casts = [
        'item_quantity' => 'integer',
        'item_sizes' => 'array',
        'item_colors' => 'array',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
