<?php

namespace App\Services\Commerce\Payment;

use App\Models\Order;
use App\Models\OrderPayment;

class UnavailablePaymentGateway implements PaymentGateway
{
    public function __construct(private readonly string $methodCode) {}
    public function code(): string { return $this->methodCode; }
    public function isConfigured(): bool { return false; }
    public function createPaymentSession(Order $order, array $context = []): PaymentResult { return new PaymentResult(false, 'failed', message: 'Payment provider is not configured.'); }
    public function retrievePayment(string $providerReference): PaymentResult { return new PaymentResult(false, 'failed', message: 'Payment provider is not configured.'); }
    public function refund(OrderPayment $payment, int $amountMinor, string $reason): PaymentResult { return new PaymentResult(false, 'failed', message: 'Payment provider is not configured.'); }
}
