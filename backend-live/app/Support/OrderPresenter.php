<?php

namespace App\Support;

use App\Models\Order;

final class OrderPresenter
{
    public static function make(Order $order, bool $admin = false): array
    {
        $money = fn (string $field): array => ['minor' => (int) $order->{$field}, 'amount' => Money::decimal((int) $order->{$field}), 'currency_code' => $order->currency_code];
        $data = [
            'uuid' => $order->uuid, 'order_number' => $order->order_number, 'order_status' => $order->order_status,
            'payment_status' => $order->payment_status, 'fulfillment_status' => $order->fulfillment_status,
            'payment_method_code' => $order->payment_method_code, 'currency_code' => $order->currency_code,
            'retail_subtotal' => $money('retail_subtotal_minor'), 'product_discount' => $money('product_discount_minor'),
            'subtotal' => $money('subtotal_minor'), 'promo_discount' => $money('promo_discount_minor'),
            'shipping' => $money('shipping_minor'), 'cod_fee' => $money('cod_fee_minor'), 'tax' => $money('tax_minor'),
            'total' => $money('total_minor'), 'paid' => $money('paid_minor'), 'refunded' => $money('refunded_minor'),
            'promotion_code' => $order->promotion_code_snapshot, 'promotion' => $order->promotion_snapshot,
            'carrier_name' => $order->carrier_name, 'tracking_number' => $order->tracking_number,
            'placed_at' => $order->placed_at?->toIso8601String(), 'confirmed_at' => $order->confirmed_at?->toIso8601String(),
            'shipped_at' => $order->shipped_at?->toIso8601String(), 'delivered_at' => $order->delivered_at?->toIso8601String(),
            'items' => $order->relationLoaded('items') ? $order->items->map(fn ($item) => [
                'uuid' => $item->uuid, 'product_uuid' => $item->product_uuid, 'product_slug' => $item->product_slug,
                'product_name' => $item->product_name, 'product_image_url' => $item->product_image_url,
                'variant_uuid' => $item->variant_uuid, 'variant_title' => $item->variant_title, 'sku' => $item->sku,
                'gtin' => $item->gtin, 'package_size' => $item->package_size, 'quantity' => $item->quantity,
                'unit_price' => Money::decimal($item->unit_price_minor), 'line_subtotal' => Money::decimal($item->line_subtotal_minor), 'product_discount' => Money::decimal($item->product_discount_minor), 'promo_discount' => Money::decimal($item->promo_discount_minor), 'line_total' => Money::decimal($item->line_total_minor),
            ])->values() : [],
            'addresses' => $order->relationLoaded('addresses') ? $order->addresses->map(fn ($address) => [
                'type' => $address->address_type, 'full_name' => $address->full_name, 'phone_number' => $address->phone_number,
                'country_key' => $address->country_key, 'address_values' => $address->address_values,
                'summary' => $address->summary, 'delivery_note' => $address->delivery_note,
            ])->values() : [],
            'history' => $order->relationLoaded('history') ? $order->history->map(fn ($history) => [
                'uuid' => $history->uuid, 'event_type' => $history->event_type, 'order_status' => $history->new_order_status,
                'payment_status' => $history->new_payment_status, 'fulfillment_status' => $history->new_fulfillment_status,
                'message' => $history->customer_visible_message, 'created_at' => $history->created_at?->toIso8601String(),
            ])->values() : [],
        ];
        if ($admin) {
            $data['payment'] = $order->relationLoaded('payment') && $order->payment ? [
                'uuid' => $order->payment->uuid, 'method_code' => $order->payment->method_code, 'provider' => $order->payment->provider,
                'status' => $order->payment->status, 'amount' => Money::decimal($order->payment->amount_minor),
                'paid_at' => $order->payment->paid_at?->toIso8601String(), 'refunded' => Money::decimal($order->payment->refunded_minor),
                'metadata' => $order->payment->metadata,
            ] : null;
            $data['customer'] = ['user_id' => $order->user_id, 'email' => $order->user?->email ?? $order->guest_email,
                'phone' => $order->user?->contact_number ?? $order->guest_phone,
                'name' => trim(($order->user?->first_name ?? '').' '.($order->user?->last_name ?? '')) ?: 'Guest customer'];
            $data['customer_note'] = $order->customer_note;
            $data['internal_note'] = $order->internal_note;
        }

        return $data;
    }
}
