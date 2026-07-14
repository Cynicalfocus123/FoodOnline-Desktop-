<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('foodonlines:about', function (): void {
    $this->comment('FoodOnlines backend ready.');
})->purpose('Show backend readiness message.');

Schedule::command('media:cleanup --limit=100')->hourly()->withoutOverlapping();
