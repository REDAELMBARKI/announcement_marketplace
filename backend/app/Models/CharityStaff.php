<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CharityStaff extends Model
{
    protected $table = 'Charity_Staff';
    protected $primaryKey = 'staff_ID';
    public $timestamps = false;

    protected $fillable = [
        'charity_ID',
        'user_ID',
    ];

    public function charity()
    {
        return $this->belongsTo(Charity::class, 'charity_ID', 'charity_ID');
    }

    public function user()
    {
        return $this->belongsTo(DomainUser::class, 'user_ID', 'user_ID');
    }
}
