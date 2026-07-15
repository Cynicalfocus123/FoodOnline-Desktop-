<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SecurityLinkNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $kind,
        private readonly string $token,
        private readonly string $expires,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $isPassword = $this->kind === 'password_recovery';
        $path = $isPassword ? '/reset-password' : '/verify-email';
        $url = rtrim((string) config('foodonlines.frontend_url'), '/') . $path . '?token=' . urlencode($this->token);

        return (new MailMessage)
            ->subject($isPassword ? 'Reset your FoodOnlines password' : 'Verify your FoodOnlines email')
            ->greeting('Hello ' . ($notifiable->name ?: 'there') . ',')
            ->line($isPassword ? 'Use the secure link below to reset your FoodOnlines password.' : 'Use the secure link below to verify your FoodOnlines email address.')
            ->action($isPassword ? 'Reset password' : 'Verify email', $url)
            ->line('This link expires ' . $this->expires . '. If you did not request this, you can ignore this message.');
    }
}
