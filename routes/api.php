<?php

use App\Http\Controllers\Api\Auth\RegisterUserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/auth/register', RegisterUserController::class)
        ->middleware('throttle:8,1')
        ->name('api.v1.auth.register');
});
