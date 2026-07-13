<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAccountDeletionRequest extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'user_name',
        'user_email',
        'user_phone',
        'reason',
        'other_reason',
        'status',
        'requested_at',
        'reviewed_at',
        'reviewed_by_admin_id',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'requested_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<User, UserAccountDeletionRequest>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
