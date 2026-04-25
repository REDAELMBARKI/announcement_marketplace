<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class HeroSlider extends Model
{
    protected $fillable = [
        'headline',
        'subline',
        'cta1_text',
        'cta1_link',
        'cta2_text',
        'cta2_link',
        'sort_order',
        'is_active',
    ];

    public function thumbnail(): MorphOne
    {
        return $this->morphOne(Media::class, 'mediable')
            ->where('collection', 'thumbnail')
            ->orderBy('sort_order');
    }
}
