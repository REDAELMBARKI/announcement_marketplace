<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'buyer_id',
        'seller_id',
        'original_price',
        'offer_price',
        'status',
        'message',
        'counter_price',
        'expires_at',
        'responded_at',
    ];

    protected $casts = [
        'original_price' => 'decimal:2',
        'offer_price' => 'decimal:2',
        'counter_price' => 'decimal:2',
        'expires_at' => 'datetime',
        'responded_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Check if offer is still pending and not expired
     */
    public function isActive(): bool
    {
        if ($this->status !== 'pending') {
            return false;
        }
        
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }
        
        return true;
    }

    /**
     * Mark offer as expired
     */
    public function markExpired(): void
    {
        $this->update(['status' => 'expired']);
    }
}
