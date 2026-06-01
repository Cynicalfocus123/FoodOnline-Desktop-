<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPaymentMethod extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'provider',
        'brand',
        'last4',
        'expiry_month',
        'expiry_year',
        'token_reference',
        'is_default',
        'status',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'is_default' => 'boolean',
    ];

    /**
     * @return BelongsTo<User, UserPaymentMethod>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
