<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    use HasFactory;
    use Notifiable;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'account_type',
        'business_type',
        'company_name',
        'contact_number',
        'email',
        'first_name',
        'last_name',
        'line_id',
        'name',
        'password',
        'phone',
        'registered_from',
        'role',
        'status',
        'staff_role', 'staff_permissions', 'mfa_secret', 'mfa_enabled_at', 'last_login_at',
    ];

    /**
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'mfa_secret',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'staff_permissions' => 'array',
        'mfa_enabled_at' => 'datetime',
        'last_login_at' => 'datetime',
    ];

    /**
     * @return HasMany<UserAddress, User>
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(UserAddress::class);
    }

    /**
     * @return HasOne<UserNotificationPreference, User>
     */
    public function notificationPreference(): HasOne
    {
        return $this->hasOne(UserNotificationPreference::class);
    }

    /**
     * @return HasMany<UserPaymentMethod, User>
     */
    public function paymentMethods(): HasMany
    {
        return $this->hasMany(UserPaymentMethod::class);
    }

    /**
     * @return HasMany<UserAccountDeletionRequest, User>
     */
    public function accountDeletionRequests(): HasMany
    {
        return $this->hasMany(UserAccountDeletionRequest::class);
    }

    public function carts(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function favorites(): HasMany { return $this->hasMany(UserFavorite::class); }
    public function savedItems(): HasMany { return $this->hasMany(UserSavedItem::class); }
    public function reviews(): HasMany { return $this->hasMany(ProductReview::class); }
    public function returnRequests(): HasMany { return $this->hasMany(ReturnRequest::class); }
    public function supportTickets(): HasMany { return $this->hasMany(SupportTicket::class); }
    public function adminRecoveryCodes(): HasMany { return $this->hasMany(AdminRecoveryCode::class); }
    public function userApiTokens(): HasMany { return $this->hasMany(UserApiToken::class); }
    public function referralCode(): HasOne { return $this->hasOne(ReferralCode::class); }
    public function referralsMade(): HasMany { return $this->hasMany(Referral::class, 'referrer_user_id'); }
    public function referralReceived(): HasOne { return $this->hasOne(Referral::class, 'referred_user_id'); }
    public function referralRewards(): HasMany { return $this->hasMany(ReferralReward::class, 'beneficiary_user_id'); }
}
