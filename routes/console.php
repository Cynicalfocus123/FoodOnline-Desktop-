<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\User;
use App\Services\Referral\ReferralCodeService;

Artisan::command('foodonlines:about', function (): void {
    $this->comment('FoodOnlines backend ready.');
})->purpose('Show backend readiness message.');

Artisan::command('referrals:backfill-codes', function (ReferralCodeService $codes): void {
    $created = array_fill_keys(ReferralCodeService::ELIGIBLE_ACCOUNT_TYPES, 0);
    $preserved = 0;
    $skipped = 0;
    User::query()->with('referralCode')->orderBy('id')->chunkById(200, function ($users) use ($codes, &$created, &$preserved, &$skipped): void {
        foreach ($users as $user) {
            if (! $codes->isEligible($user)) {
                $skipped++;
                continue;
            }
            if ($user->referralCode) {
                $preserved++;
                continue;
            }
            if ($codes->ensure($user)) {
                $created[$codes->accountType($user)]++;
            }
        }
    });
    $total = array_sum($created);
    $this->info("Customer codes created: {$created['customer']}");
    $this->info("Supplier codes created: {$created['supplier']}");
    $this->info("Partner codes created: {$created['partner']}");
    $this->info("Existing codes preserved: {$preserved}");
    $this->info("Ineligible accounts skipped: {$skipped}");
    $this->info("Total codes created: {$total}");
})->purpose('Backfill permanent referral codes for eligible Customer, Supplier, and Partner accounts.');

Schedule::command('media:cleanup --limit=100')->hourly()->withoutOverlapping();
Schedule::command('media:diagnose')->dailyAt('03:30')->withoutOverlapping();
Schedule::command('inventory:expire-reservations --limit=100')->everyFiveMinutes()->withoutOverlapping();
Schedule::command('commerce:maintenance --limit=500')->dailyAt('04:00')->withoutOverlapping();
