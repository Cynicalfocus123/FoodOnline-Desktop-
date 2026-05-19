<?php

use App\Http\Controllers\Api\Admin\AdminAuthController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminSettingsController;
use App\Http\Controllers\Api\Admin\AdminUsersController;
use App\Http\Controllers\Api\Auth\RegisterUserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/auth/register', RegisterUserController::class)
        ->middleware('throttle:8,1')
        ->name('api.v1.auth.register');

    Route::prefix('admin')->group(function (): void {
        Route::post('/login', [AdminAuthController::class, 'login'])
            ->middleware('throttle:5,1')
            ->name('api.v1.admin.login');

        Route::middleware(['admin.token', 'throttle:60,1'])->group(function (): void {
            Route::post('/logout', [AdminAuthController::class, 'logout'])->name('api.v1.admin.logout');
            Route::get('/me', [AdminAuthController::class, 'me'])->name('api.v1.admin.me');
            Route::get('/users', [AdminUsersController::class, 'index'])->name('api.v1.admin.users');
            Route::put('/settings', [AdminSettingsController::class, 'update'])->name('api.v1.admin.settings');
            Route::get('/dashboard-stats', [AdminDashboardController::class, 'stats'])->name('api.v1.admin.dashboard-stats');
        });
    });
});
