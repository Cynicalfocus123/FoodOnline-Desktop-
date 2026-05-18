<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RegistrationSuccessMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    /**
     * @param  array<string, mixed>  $recipient
     */
    public function __construct(
        public array $recipient,
        public ?string $accountType = null,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to FoodOnlines.com',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.registration-success',
            with: [
                'firstName' => $this->resolveFirstName(),
                'accountType' => $this->resolveAccountType(),
                'ctaUrl' => $this->resolveFrontendUrl(),
                'logoPath' => $this->resolveLogoPath(),
            ],
        );
    }

    private function resolveFirstName(): string
    {
        $candidates = [
            $this->recipient['first_name'] ?? null,
            $this->recipient['firstName'] ?? null,
        ];

        foreach ($candidates as $candidate) {
            if (is_string($candidate) && trim($candidate) !== '') {
                return trim($candidate);
            }
        }

        $name = $this->recipient['name'] ?? null;

        if (is_string($name) && trim($name) !== '') {
            $parts = preg_split('/\s+/', trim($name));

            if (is_array($parts) && $parts !== []) {
                return (string) $parts[0];
            }
        }

        return 'there';
    }

    private function resolveAccountType(): string
    {
        $role = $this->accountType;

        if (! is_string($role) || trim($role) === '') {
            $role = $this->recipient['account_type']
                ?? $this->recipient['role']
                ?? $this->recipient['user_type']
                ?? null;
        }

        $normalizedRole = strtolower(trim((string) $role));

        return match ($normalizedRole) {
            'supplier' => 'supplier',
            'partner' => 'partner',
            default => 'customer',
        };
    }

    private function resolveFrontendUrl(): string
    {
        $url = config('app.frontend_url')
            ?: env('FRONTEND_URL')
            ?: config('app.url');

        if (! is_string($url) || trim($url) === '') {
            return '/';
        }

        return rtrim($url, '/');
    }

    private function resolveLogoPath(): ?string
    {
        $candidatePaths = [
            public_path('assets/food-online-long-text-cutout.png'),
            public_path('assets/logo-transparent.png'),
        ];

        foreach ($candidatePaths as $path) {
            if (is_string($path) && is_file($path)) {
                return $path;
            }
        }

        return null;
    }
}
