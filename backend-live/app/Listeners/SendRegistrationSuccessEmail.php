<?php

namespace App\Listeners;

use App\Mail\RegistrationSuccessMail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendRegistrationSuccessEmail
{
    public function handle(Registered $event): void
    {
        $user = $event->user;
        $email = $this->stringValue($user->email ?? null);

        if ($email === null) {
            return;
        }

        $payload = [
            'user_id' => $user->getAuthIdentifier(),
            'email' => $email,
            'first_name' => $this->stringValue($user->first_name ?? $user->firstName ?? null),
            'name' => $this->stringValue($user->name ?? null),
            'account_type' => $this->resolveAccountType($user),
        ];

        dispatch(function () use ($payload): void {
            try {
                Mail::to($payload['email'])->send(new RegistrationSuccessMail(
                    recipient: $payload,
                    accountType: $payload['account_type'],
                ));
            } catch (Throwable $exception) {
                Log::warning('Registration success email failed to send.', [
                    'user_id' => $payload['user_id'],
                    'account_type' => $payload['account_type'],
                    'exception' => $exception::class,
                ]);
            }
        })->afterResponse();
    }

    private function resolveAccountType(object $user): string
    {
        $role = $this->stringValue($user->role ?? $user->account_type ?? $user->user_type ?? null);
        $normalizedRole = strtolower($role ?? 'customer');

        return match ($normalizedRole) {
            'supplier' => 'supplier',
            'partner' => 'partner',
            default => 'customer',
        };
    }

    private function stringValue(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return trim($value);
    }
}
