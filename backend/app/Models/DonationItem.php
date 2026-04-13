<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DonationItem extends Model
{
    protected $table = 'Donation_Item';
    protected $primaryKey = 'item_ID';
    public $timestamps = false;

    protected $fillable = [
        'donation_ID',
        'item_name',
        'item_category',
        'item_size',
        'item_condition',
        'item_description',
        'item_image',
    ];

    public function donation()
    {
        return $this->belongsTo(Donation::class, 'donation_ID', 'donation_ID');
    }
}
