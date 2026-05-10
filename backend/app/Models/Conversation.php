<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Support\Str;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'product_id',
        'last_message_at',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($conversation) {
            $conversation->slug = Str::random(20);
        });
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    protected $appends = ['buyer', 'seller'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function participants(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Accessor to get the buyer participant as a single object.
     */
    public function getBuyerAttribute()
    {
        return $this->participants->where('pivot.role', 'buyer')->first();
    }

    /**
     * Accessor to get the seller participant as a single object.
     */
    public function getSellerAttribute()
    {
        return $this->participants->where('pivot.role', 'seller')->first();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}
