<?php

namespace App\Services\Commerce;

use Illuminate\Validation\ValidationException;

class PaymentMethodService
{
    public function __construct(private readonly CommerceSettingsService $settings) {}

    public function methods(): array
    {
        $codEnabled = (bool) ($this->settings->all()['cod_enabled'] ?? true);
        $definitions = [
            ['code' => 'cod', 'label' => 'Cash on Delivery', 'enabled' => $codEnabled, 'requires_provider' => false],
            ['code' => 'card', 'label' => 'Credit or Debit Card', 'enabled' => false, 'requires_provider' => true],
            ['code' => 'bank_transfer', 'label' => 'Bank Transfer', 'enabled' => false, 'requires_provider' => true],
            ['code' => 'promptpay', 'label' => 'PromptPay', 'enabled' => false, 'requires_provider' => true],
            ['code' => 'paypal', 'label' => 'PayPal', 'enabled' => false, 'requires_provider' => true],
            ['code' => 'google_pay', 'label' => 'Google Pay', 'enabled' => false, 'requires_provider' => true],
            ['code' => 'alipay', 'label' => 'Alipay', 'enabled' => false, 'requires_provider' => true],
            ['code' => 'cash_app', 'label' => 'Cash App', 'enabled' => false, 'requires_provider' => true],
        ];

        return array_map(fn (array $method, int $index) => [...$method,
            'unavailable_reason' => $method['enabled'] ? null : ($method['code'] === 'cod' ? 'Cash on Delivery is disabled by the store.' : 'Payment provider is not configured.'),
            'provider' => null, 'supports_saved_methods' => false, 'supports_guest_checkout' => $method['code'] === 'cod', 'display_order' => $index + 1,
        ], $definitions, array_keys($definitions));
    }

    public function requireEnabled(string $code, ?string $country = null, int $totalMinor = 0): array
    {
        $method = collect($this->methods())->firstWhere('code', $code);
        if (! $method || ! $method['enabled']) {
            throw ValidationException::withMessages(['payment_method_code' => [$method['unavailable_reason'] ?? 'Payment method is unavailable.']]);
        }

        if ($code === 'cod') {
            $settings = $this->settings->all();
            $countries = array_map('strtolower', (array) ($settings['cod_supported_countries'] ?? []));
            if ($countries && $country && ! in_array(strtolower($country), $countries, true)) {
                throw ValidationException::withMessages(['payment_method_code' => ['Cash on Delivery is unavailable for this country.']]);
            }
            if ($totalMinor < (int) ($settings['cod_minimum_minor'] ?? 0) || (($settings['cod_maximum_minor'] ?? null) !== null && $totalMinor > (int) $settings['cod_maximum_minor'])) {
                throw ValidationException::withMessages(['payment_method_code' => ['This order is outside the Cash on Delivery amount limits.']]);
            }
        }

        return $method;
    }
}
