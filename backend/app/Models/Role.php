<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Role extends Model
{
    protected $table = 'Role';
    protected $primaryKey = 'role_ID';
    public $timestamps = false;

    protected $fillable = [
        'role_name',
        'role_description',
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'role_id', 'role_ID');
    }
}
