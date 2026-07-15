<?php

namespace App\Jobs;

use App\Mail\OrderConfirmationMail;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendOrderConfirmation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public function __construct(public readonly int $orderId) { $this->afterCommit = true; }
    public function handle(): void
    {
        $order = Order::query()->with('user')->find($this->orderId);
        $email = $order?->user?->email ?? $order?->guest_email;
        if (! $order || ! $email) { return; }
        try { Mail::to($email)->send(new OrderConfirmationMail($order)); }
        catch (\Throwable $exception) { Log::warning('Order confirmation email failed.', ['order_id' => $order->id, 'exception' => $exception::class]); }
    }
}
