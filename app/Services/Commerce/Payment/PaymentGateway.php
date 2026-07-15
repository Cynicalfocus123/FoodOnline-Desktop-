<?php

namespace App\Services\Commerce\Payment;

use App\Models\Order;
use App\Models\OrderPayment;

interface PaymentGateway
{
    public function code(): string;
    public function isConfigured(): bool;
    public function createPaymentSession(Order $order, array $context = []): PaymentResult;
    public function retrievePayment(string $providerReference): PaymentResult;
    public function refund(OrderPayment $payment, int $amountMinor, string $reason): PaymentResult;
}
