<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Commerce\CommerceSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminCommerceSettingsController extends Controller
{
    public function show(CommerceSettingsService $service): JsonResponse { return response()->json(['settings' => $service->all()]); }
    public function update(Request $request, CommerceSettingsService $service): JsonResponse
    {
        $values = $request->validate(['store_currency' => ['sometimes', 'string', 'size:3'], 'shipping_enabled' => ['sometimes', 'boolean'],
            'standard_shipping_minor' => ['sometimes', 'integer', 'min:0'], 'free_shipping_threshold_minor' => ['sometimes', 'integer', 'min:0'],
            'supported_countries' => ['sometimes', 'array'], 'supported_countries.*' => ['string', 'max:40'], 'cod_enabled' => ['sometimes', 'boolean'],
            'cod_fee_minor' => ['sometimes', 'integer', 'min:0'], 'cod_minimum_minor' => ['sometimes', 'integer', 'min:0'], 'cod_maximum_minor' => ['nullable', 'integer', 'min:0'],
            'cod_supported_countries' => ['sometimes', 'array'], 'cod_supported_countries.*' => ['string', 'max:40'], 'guest_checkout_enabled' => ['sometimes', 'boolean'],
            'reservation_minutes' => ['sometimes', 'integer', 'min:5', 'max:1440'], 'quote_minutes' => ['sometimes', 'integer', 'min:5', 'max:60'],
            'order_cancellation_minutes' => ['sometimes', 'integer', 'min:0', 'max:10080'], 'tax_mode' => ['sometimes', Rule::in(['disabled', 'flat_rate'])],
            'flat_tax_basis_points' => ['sometimes', 'integer', 'min:0', 'max:10000'], 'order_support_email' => ['sometimes', 'email:rfc', 'max:254'],
            'order_notification_email' => ['sometimes', 'email:rfc', 'max:254']]);
        if (isset($values['store_currency'])) { $values['store_currency'] = strtoupper($values['store_currency']); }
        return response()->json(['settings' => $service->update($values, $request->user(), $request)]);
    }
}
