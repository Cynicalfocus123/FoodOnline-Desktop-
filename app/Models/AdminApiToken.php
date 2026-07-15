<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminApiToken extends Model
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
        'ip_address', 'user_agent', 'last_reauthenticated_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
        'last_reauthenticated_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<User, AdminApiToken>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
