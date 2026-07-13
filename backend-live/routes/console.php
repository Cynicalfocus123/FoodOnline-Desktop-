<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('foodonlines:about', function (): void {
    $this->comment('FoodOnlines backend ready.');
})->purpose('Show backend readiness message.');
