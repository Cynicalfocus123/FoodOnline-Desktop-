<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserApiToken extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'token_hash',
        'last_used_at',
        'expires_at',
        'revoked_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<User, UserApiToken>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
