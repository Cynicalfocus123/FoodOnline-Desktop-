<?php

namespace App\Support;

final class CommerceStatus
{
    public const CART = ['active', 'converted', 'abandoned', 'expired'];
    public const ORDER = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];
    public const PAYMENT = ['pending', 'authorized', 'paid', 'failed', 'cancelled', 'partially_refunded', 'refunded'];
    public const FULFILLMENT = ['unfulfilled', 'reserved', 'processing', 'shipped', 'delivered', 'returned', 'cancelled'];
    public const RESERVATION = ['active', 'consumed', 'released', 'expired'];
    public const DISCOUNT_TYPES = ['percentage', 'fixed'];
    public const PROMOTION_TARGETS = ['all', 'products', 'categories'];
    public const PAYMENT_METHODS = ['cod', 'card', 'bank_transfer', 'promptpay', 'paypal', 'google_pay', 'alipay', 'cash_app'];
    public const MOVEMENT_TYPES = ['initial', 'adjustment', 'reservation_created', 'reservation_released', 'reservation_consumed', 'order_cancelled', 'return_restock', 'damage', 'correction'];
}
