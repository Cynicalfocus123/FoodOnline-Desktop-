<?php

namespace App\Services\Commerce;

use Illuminate\Validation\ValidationException;

class ShippingService
{
    public function __construct(private readonly CommerceSettingsService $settings) {}

    public function calculate(array $address, int $subtotalMinor): array
    {
        $settings = $this->settings->all();
        if (! ($settings['shipping_enabled'] ?? true)) {
            throw ValidationException::withMessages(['shipping_address' => ['Shipping is currently unavailable.']]);
        }
        $country = strtolower((string) ($address['country_key'] ?? ''));
        $supported = array_map('strtolower', (array) ($settings['supported_countries'] ?? []));
        if ($supported && ! in_array($country, $supported, true)) {
            throw ValidationException::withMessages(['shipping_address' => ['Shipping is unavailable for this country.']]);
        }
        $amount = $subtotalMinor >= (int) ($settings['free_shipping_threshold_minor'] ?? 4900) ? 0 : (int) ($settings['standard_shipping_minor'] ?? 599);

        return ['code' => 'standard', 'label' => 'Standard shipping', 'amount_minor' => $amount, 'estimated_delivery' => 'Estimated delivery in 3–7 business days.', 'eligible' => true, 'unavailable_reason' => null];
    }
}
