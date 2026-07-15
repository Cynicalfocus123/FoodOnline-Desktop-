<?php

namespace App\Services\Commerce\Payment;

use App\Models\Order;
use App\Models\OrderPayment;

class CashOnDeliveryGateway implements PaymentGateway
{
    public function code(): string { return 'cod'; }
    public function isConfigured(): bool { return true; }
    public function createPaymentSession(Order $order, array $context = []): PaymentResult { return new PaymentResult(true, 'pending', message: 'Payment will be collected on delivery.'); }
    public function retrievePayment(string $providerReference): PaymentResult { return new PaymentResult(false, 'pending', message: 'Cash on Delivery has no provider payment.'); }
    public function refund(OrderPayment $payment, int $amountMinor, string $reason): PaymentResult { return new PaymentResult(false, 'failed', message: 'Record COD refunds through the admin refund workflow.'); }
}
