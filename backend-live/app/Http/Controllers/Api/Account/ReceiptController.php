<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Response;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->user_id === $request->user()->id, 404);
        $order->load('items', 'addresses');
        $escape = static fn (?string $value): string => e($value ?? '');
        $currency = $escape($order->currency_code);
        $rows = '';

        foreach ($order->items as $item) {
            $rows .= '<tr><td>' . $escape($item->product_name) . ' — ' . $escape($item->variant_title) . '</td><td>' . (int) $item->quantity . '</td><td>' . $currency . ' ' . number_format($item->line_total_minor / 100, 2) . '</td></tr>';
        }

        $shipping = $order->addresses->firstWhere('address_type', 'shipping');
        $shipTo = $shipping?->address_values ? e(implode(', ', array_filter((array) $shipping->address_values, 'is_scalar'))) : 'Not supplied';
        $html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Receipt ' . $escape($order->order_number) . '</title><style>body{font-family:Arial,sans-serif;color:#172018;max-width:760px;margin:40px auto;padding:0 20px}h1{color:#177245}table{border-collapse:collapse;width:100%;margin:24px 0}td,th{border-bottom:1px solid #ddd;padding:10px;text-align:left}td:last-child,th:last-child{text-align:right}.total{text-align:right;font-size:1.2rem;font-weight:700}</style></head><body><h1>FoodOnlines receipt</h1><p><strong>Order:</strong> ' . $escape($order->order_number) . '<br><strong>Placed:</strong> ' . $escape($order->placed_at?->toIso8601String()) . '<br><strong>Payment:</strong> ' . $escape($order->payment_method_code) . ' (' . $escape($order->payment_status) . ')</p><p><strong>Ship to:</strong><br>' . $shipTo . '</p><table><thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead><tbody>' . $rows . '</tbody></table><p class="total">Total: ' . $currency . ' ' . number_format($order->total_minor / 100, 2) . '</p></body></html>';

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Content-Disposition' => 'inline; filename="receipt-' . $escape($order->order_number) . '.html"',
            'X-Robots-Tag' => 'noindex, nofollow',
        ]);
    }
}
