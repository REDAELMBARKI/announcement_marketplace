<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $table = 'Inventory';
    protected $primaryKey = 'inventory_ID';
    public $timestamps = false;

    protected $fillable = [
        'charity_ID',
        'item',
        'category',
        'size',
        'quantity',
    ];

    public function charity()
    {
        return $this->belongsTo(Charity::class, 'charity_ID', 'charity_ID');
    }
}
