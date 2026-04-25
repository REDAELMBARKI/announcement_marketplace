<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Banner extends Model
{
    protected $fillable = [
        'type',
        'title',
        'subtitle',
        'badge_text',
        'cta_text',
        'cta_link',
        'steps',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'steps' => 'array',
        'is_active' => 'boolean',
    ];

    public function thumbnail(): MorphOne
    {
        return $this->morphOne(Media::class, 'mediable')
            ->where('collection', 'thumbnail')
            ->orderBy('sort_order');
    }
}
