<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Charity extends Model
{
    protected $table = 'Charity';
    protected $primaryKey = 'charity_ID';
    public $timestamps = false;

    protected $fillable = [
        'charity_name',
        'charity_address',
        'charity_email',
        'contact_person',
    ];

    public function staff()
    {
        return $this->hasMany(CharityStaff::class, 'charity_ID', 'charity_ID');
    }

    public function donations()
    {
        return $this->hasMany(Donation::class, 'charity_ID', 'charity_ID');
    }

    public function inventory()
    {
        return $this->hasMany(Inventory::class, 'charity_ID', 'charity_ID');
    }
}
