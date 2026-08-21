<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'addressable_id',
        'addressable_type',
        'country_id',
        'city',
        'district',
        'place_id',
        'address_line',
        'lat',
        'lng',
        'is_default',
    ];

    protected $casts = [
        'country_id' => 'integer',
        'lat' => 'decimal:7',
        'lng' => 'decimal:7',
        'is_default' => 'boolean',
    ];

    /**
     * attributes hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'addressable_id',
        'addressable_type',
        'created_at',
        'updated_at',
    ];

    public function addressable(): MorphTo
    {
        return $this->morphTo();
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }
}
