<?php

namespace App\Services\Commerce\Payment;

final readonly class PaymentResult
{
    public function __construct(public bool $successful, public string $status, public ?string $reference = null, public ?string $message = null) {}
}
