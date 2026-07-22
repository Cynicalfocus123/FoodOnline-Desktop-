<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasPublicUuid;

    protected $fillable = ['uuid', 'order_number', 'user_id', 'guest_email', 'guest_phone', 'guest_access_token_hash', 'checkout_quote_id', 'cart_id', 'actor_key', 'idempotency_key', 'order_status', 'payment_status', 'fulfillment_status', 'currency_code', 'retail_subtotal_minor', 'product_discount_minor', 'subtotal_minor', 'promo_discount_minor', 'shipping_minor', 'cod_fee_minor', 'tax_minor', 'total_minor', 'paid_minor', 'refunded_minor', 'payment_method_code', 'shipping_method_code', 'carrier_name', 'tracking_number', 'promotion_code_snapshot', 'promotion_snapshot', 'customer_note', 'internal_note', 'placed_at', 'confirmed_at', 'cancelled_at', 'completed_at', 'shipped_at', 'delivered_at'];
    protected $hidden = ['guest_access_token_hash', 'actor_key', 'idempotency_key', 'internal_note'];
    protected function casts(): array { return ['retail_subtotal_minor' => 'integer', 'product_discount_minor' => 'integer', 'subtotal_minor' => 'integer', 'promo_discount_minor' => 'integer', 'shipping_minor' => 'integer', 'cod_fee_minor' => 'integer', 'tax_minor' => 'integer', 'total_minor' => 'integer', 'paid_minor' => 'integer', 'refunded_minor' => 'integer', 'promotion_snapshot' => 'array', 'placed_at' => 'datetime', 'confirmed_at' => 'datetime', 'cancelled_at' => 'datetime', 'completed_at' => 'datetime', 'shipped_at' => 'datetime', 'delivered_at' => 'datetime']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function items(): HasMany { return $this->hasMany(OrderItem::class); }
    public function addresses(): HasMany { return $this->hasMany(OrderAddress::class); }
    public function payment(): HasOne { return $this->hasOne(OrderPayment::class); }
    public function history(): HasMany { return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at'); }
    public function reservations(): HasMany { return $this->hasMany(InventoryReservation::class); }
    public function notes(): HasMany { return $this->hasMany(OrderNote::class); }
    public function returns(): HasMany { return $this->hasMany(ReturnRequest::class); }
    public function supportTickets(): HasMany { return $this->hasMany(SupportTicket::class); }
    public function referralRewards(): HasMany { return $this->hasMany(ReferralReward::class, 'qualifying_order_id'); }
}
