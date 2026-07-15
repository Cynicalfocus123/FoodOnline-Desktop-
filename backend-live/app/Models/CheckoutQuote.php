<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckoutQuote extends Model
{
    use HasPublicUuid;

    protected $fillable = ['uuid', 'cart_id', 'user_id', 'guest_email', 'currency_code', 'retail_subtotal_minor', 'subtotal_minor', 'product_discount_minor', 'promo_discount_minor', 'shipping_minor', 'cod_fee_minor', 'tax_minor', 'total_minor', 'promo_code', 'promotion_id', 'payment_method_code', 'shipping_address_payload', 'billing_address_payload', 'item_snapshot', 'calculation_hash', 'expires_at', 'consumed_at'];
    protected function casts(): array { return ['retail_subtotal_minor' => 'integer', 'subtotal_minor' => 'integer', 'product_discount_minor' => 'integer', 'promo_discount_minor' => 'integer', 'shipping_minor' => 'integer', 'cod_fee_minor' => 'integer', 'tax_minor' => 'integer', 'total_minor' => 'integer', 'shipping_address_payload' => 'array', 'billing_address_payload' => 'array', 'item_snapshot' => 'array', 'expires_at' => 'datetime', 'consumed_at' => 'datetime']; }
    public function cart(): BelongsTo { return $this->belongsTo(Cart::class); }
    public function promotion(): BelongsTo { return $this->belongsTo(Promotion::class); }
}
