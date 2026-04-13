<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
        return $this->hasMany(DomainUser::class, 'role_ID', 'role_ID');
    }
}
