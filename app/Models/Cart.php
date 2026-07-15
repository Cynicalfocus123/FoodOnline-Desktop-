<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasPublicUuid;

    protected $fillable = ['uuid', 'user_id', 'guest_token_hash', 'status', 'currency_code', 'expires_at', 'last_activity_at', 'converted_order_id'];
    protected $hidden = ['guest_token_hash'];
    protected function casts(): array { return ['expires_at' => 'datetime', 'last_activity_at' => 'datetime']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function items(): HasMany { return $this->hasMany(CartItem::class); }
}
