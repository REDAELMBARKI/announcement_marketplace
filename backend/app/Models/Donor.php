<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Donor extends Model
{
    protected $table = 'Donor';
    protected $primaryKey = 'donor_ID';
    public $timestamps = false;

    protected $fillable = [
        'donor_address',
        'user_ID',
    ];

    public function user()
    {
        return $this->belongsTo(DomainUser::class, 'user_ID', 'user_ID');
    }

    public function donations()
    {
        return $this->hasMany(Donation::class, 'donor_ID', 'donor_ID');
    }
}
