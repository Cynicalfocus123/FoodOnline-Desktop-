<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\User;
use App\Services\Referral\ReferralCodeService;

Artisan::command('foodonlines:about', function (): void {
    $this->comment('FoodOnlines backend ready.');
})->purpose('Show backend readiness message.');

Artisan::command('referrals:backfill-codes', function (ReferralCodeService $codes): void {
    $created = 0;
    User::query()->orderBy('id')->chunkById(200, function ($users) use ($codes, &$created): void {
        foreach ($users as $user) {
            if (! $user->referralCode && $codes->ensure($user)) $created++;
        }
    });
    $this->info("Created {$created} eligible referral codes.");
})->purpose('Backfill permanent referral codes for eligible customer accounts.');

Schedule::command('media:cleanup --limit=100')->hourly()->withoutOverlapping();
Schedule::command('media:diagnose')->dailyAt('03:30')->withoutOverlapping();
Schedule::command('inventory:expire-reservations --limit=100')->everyFiveMinutes()->withoutOverlapping();
Schedule::command('commerce:maintenance --limit=500')->dailyAt('04:00')->withoutOverlapping();
