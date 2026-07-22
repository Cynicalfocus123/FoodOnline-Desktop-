<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request): Limit {
            $actor = $request->user()?->getAuthIdentifier();

            return $this->perMinute(120, 'api:'.($actor !== null ? 'user:'.$actor : 'ip:'.$request->ip()));
        });

        RateLimiter::for('registration', fn (Request $request): array => [
            $this->perMinute(8, 'registration:minute:'.$request->ip()),
            $this->perDay(25, 'registration:day:'.$request->ip()),
        ]);

        RateLimiter::for('login', fn (Request $request): array => [
            $this->perMinute(20, 'login:ip:'.$request->ip()),
            $this->perMinute(5, 'login:credentials:'.$this->credentialKey($request)),
        ]);

        RateLimiter::for('admin-login', fn (Request $request): array => [
            $this->perMinute(10, 'admin-login:ip:'.$request->ip()),
            $this->perMinute(5, 'admin-login:credentials:'.$this->credentialKey($request)),
        ]);

        RateLimiter::for('referral-public', fn (Request $request): Limit => $this->perMinute(30, 'referral-public:'.$request->ip()));
        RateLimiter::for('referral-customer', fn (Request $request): Limit => $this->perMinute(60, 'referral-customer:'.($request->user()?->id ?? $request->ip())));
    }

    private function perMinute(int $attempts, string $key): Limit
    {
        return Limit::perMinute($attempts)
            ->by($key)
            ->response(fn (Request $request, array $headers) => response()->json([
                'message' => 'Too many requests. Please try again later.',
            ], 429, $headers));
    }

    private function perDay(int $attempts, string $key): Limit
    {
        return Limit::perDay($attempts)
            ->by($key)
            ->response(fn (Request $request, array $headers) => response()->json([
                'message' => 'Too many requests. Please try again later.',
            ], 429, $headers));
    }

    private function credentialKey(Request $request): string
    {
        $email = strtolower(trim((string) $request->input('email', '')));

        return hash('sha256', $request->ip().'|'.$email);
    }
}
