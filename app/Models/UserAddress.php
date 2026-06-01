<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAddress extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'country_key',
        'address_values',
        'summary',
        'is_default',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'address_values' => 'array',
        'is_default' => 'boolean',
    ];

    /**
     * @return BelongsTo<User, UserAddress>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
