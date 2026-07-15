<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('foodonlines:about', function (): void {
    $this->comment('FoodOnlines backend ready.');
})->purpose('Show backend readiness message.');

Schedule::command('media:cleanup --limit=100')->hourly()->withoutOverlapping();
Schedule::command('media:diagnose')->dailyAt('03:30')->withoutOverlapping();
Schedule::command('inventory:expire-reservations --limit=100')->everyFiveMinutes()->withoutOverlapping();
Schedule::command('commerce:maintenance --limit=500')->dailyAt('04:00')->withoutOverlapping();
