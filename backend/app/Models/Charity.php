<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Charity extends Model
{
    protected $table = 'Charity';

    protected $primaryKey = 'charity_ID';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'charity_name',
        'charity_address',
        'charity_email',
        'contact_person',
        'charity_phone',
        'user_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
