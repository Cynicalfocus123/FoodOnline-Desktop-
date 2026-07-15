<?php

namespace App\Services\Commerce\Payment;

class PaymentGatewayRegistry
{
    public function resolve(string $code): PaymentGateway
    {
        return $code === 'cod' ? app(CashOnDeliveryGateway::class) : new UnavailablePaymentGateway($code);
    }
}
