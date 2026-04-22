<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'mediable_id',
        'mediable_type',
        'disk',
        'path',
        'url',
        'file_name',
        'mime_type',
        'size',
        'collection',
        'sort_order',
        'is_temporary',
    ];

    protected $casts = [
        'size' => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * attributes hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'mediable_id',
        'mediable_type',
        'disk',
        'is_temporary',
        'created_at',
        'updated_at',
    ];

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }
}
