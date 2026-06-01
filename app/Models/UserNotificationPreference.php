<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotificationPreference extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'order_updates',
        'delivery_updates',
        'promotions_and_coupons',
        'back_in_stock_alerts',
        'saved_item_price_drops',
        'email_notifications',
        'sms_notifications',
        'push_notifications',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'order_updates' => 'boolean',
        'delivery_updates' => 'boolean',
        'promotions_and_coupons' => 'boolean',
        'back_in_stock_alerts' => 'boolean',
        'saved_item_price_drops' => 'boolean',
        'email_notifications' => 'boolean',
        'sms_notifications' => 'boolean',
        'push_notifications' => 'boolean',
    ];

    /**
     * @return BelongsTo<User, UserNotificationPreference>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
