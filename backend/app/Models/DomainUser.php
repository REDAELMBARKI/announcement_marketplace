<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DomainUser extends Model
{
    protected $table = 'User';

    protected $primaryKey = 'user_ID';

    public $timestamps = false;

    protected $fillable = [
        'user_name',
        'user_email',
        'user_password',
        'role_id',
    ];
    protected $hidden = ['user_password'];
}
