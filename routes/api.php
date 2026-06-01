<?php

use App\Http\Controllers\Api\Admin\AdminAuthController;
use App\Http\Controllers\Api\Admin\AdminAccountDeletionRequestsController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminSettingsController;
use App\Http\Controllers\Api\Admin\AdminUsersController;
use App\Http\Controllers\Api\Account\AccountDeletionRequestController;
use App\Http\Controllers\Api\Account\AddressBookController;
use App\Http\Controllers\Api\Account\NotificationPreferenceController;
use App\Http\Controllers\Api\Account\PasswordController;
use App\Http\Controllers\Api\Account\PaymentMethodController;
use App\Http\Controllers\Api\Auth\CurrentUserController;
use App\Http\Controllers\Api\Auth\LoginUserController;
use App\Http\Controllers\Api\Auth\LogoutUserController;
use App\Http\Controllers\Api\Auth\RegisterUserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/auth/register', RegisterUserController::class)
        ->middleware('throttle:8,1')
        ->name('api.v1.auth.register');

    Route::post('/auth/login', LoginUserController::class)
        ->middleware('throttle:5,1')
        ->name('api.v1.auth.login');

    Route::middleware(['user.token', 'throttle:60,1'])->group(function (): void {
        Route::post('/auth/logout', LogoutUserController::class)->name('api.v1.auth.logout');
        Route::get('/auth/me', CurrentUserController::class)->name('api.v1.auth.me');

        Route::get('/account/addresses', [AddressBookController::class, 'index'])->name('api.v1.account.addresses.index');
        Route::post('/account/addresses', [AddressBookController::class, 'store'])->name('api.v1.account.addresses.store');
        Route::put('/account/addresses/{addressId}', [AddressBookController::class, 'update'])->name('api.v1.account.addresses.update');
        Route::delete('/account/addresses/{addressId}', [AddressBookController::class, 'destroy'])->name('api.v1.account.addresses.destroy');
        Route::put('/account/addresses/{addressId}/default', [AddressBookController::class, 'makeDefault'])->name('api.v1.account.addresses.default');

        Route::get('/account/notification-preferences', [NotificationPreferenceController::class, 'show'])->name('api.v1.account.notifications.show');
        Route::put('/account/notification-preferences', [NotificationPreferenceController::class, 'update'])->name('api.v1.account.notifications.update');

        Route::get('/account/payment-methods', [PaymentMethodController::class, 'index'])->name('api.v1.account.payment-methods.index');
        Route::post('/account/payment-methods', [PaymentMethodController::class, 'store'])->name('api.v1.account.payment-methods.store');
        Route::delete('/account/payment-methods/{methodId}', [PaymentMethodController::class, 'destroy'])->name('api.v1.account.payment-methods.destroy');
        Route::put('/account/payment-methods/{methodId}/default', [PaymentMethodController::class, 'makeDefault'])->name('api.v1.account.payment-methods.default');

        Route::put('/account/password', [PasswordController::class, 'update'])->name('api.v1.account.password.update');
        Route::post('/account/delete-request', [AccountDeletionRequestController::class, 'store'])->name('api.v1.account.delete-request.store');
    });

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
            Route::get('/delete-account-requests', [AdminAccountDeletionRequestsController::class, 'index'])->name('api.v1.admin.delete-account-requests.index');
            Route::put('/delete-account-requests/{requestId}', [AdminAccountDeletionRequestsController::class, 'update'])->name('api.v1.admin.delete-account-requests.update');
        });
    });
});
