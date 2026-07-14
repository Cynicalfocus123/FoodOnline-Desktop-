<?php

use App\Http\Controllers\Api\Admin\AdminAuthController;
use App\Http\Controllers\Api\Admin\AdminAccountDeletionRequestsController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminSettingsController;
use App\Http\Controllers\Api\Admin\AdminUsersController;
use App\Http\Controllers\Api\Admin\AdminCategoryAliasController;
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminBrandController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminProductMediaController;
use App\Http\Controllers\Api\Admin\AdminProductVariantController;
use App\Http\Controllers\Api\Admin\AdminMediaUploadController;
use App\Http\Controllers\Api\Admin\AdminProductNutritionFactController;
use App\Http\Controllers\Api\Account\AccountDeletionRequestController;
use App\Http\Controllers\Api\Account\AddressBookController;
use App\Http\Controllers\Api\Account\NotificationPreferenceController;
use App\Http\Controllers\Api\Account\PasswordController;
use App\Http\Controllers\Api\Account\PaymentMethodController;
use App\Http\Controllers\Api\Auth\CurrentUserController;
use App\Http\Controllers\Api\Auth\LoginUserController;
use App\Http\Controllers\Api\Auth\LogoutUserController;
use App\Http\Controllers\Api\Auth\RegisterUserController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\Catalog\CategoryController;
use App\Http\Controllers\Api\Catalog\BrandController;
use App\Http\Controllers\Api\Catalog\ProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', HealthController::class)
        ->middleware('throttle:api')
        ->name('api.v1.health');

    Route::post('/auth/register', RegisterUserController::class)
        ->middleware(['throttle:api', 'throttle:registration'])
        ->name('api.v1.auth.register');

    Route::post('/auth/login', LoginUserController::class)
        ->middleware(['throttle:api', 'throttle:login'])
        ->name('api.v1.auth.login');

    Route::middleware(['user.token', 'throttle:api'])->group(function (): void {
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
            ->middleware(['throttle:api', 'throttle:admin-login'])
            ->name('api.v1.admin.login');

        Route::middleware(['admin.token', 'throttle:api'])->group(function (): void {
            Route::post('/logout', [AdminAuthController::class, 'logout'])->name('api.v1.admin.logout');
            Route::get('/me', [AdminAuthController::class, 'me'])->name('api.v1.admin.me');
            Route::get('/users', [AdminUsersController::class, 'index'])->name('api.v1.admin.users');
            Route::put('/settings', [AdminSettingsController::class, 'update'])->name('api.v1.admin.settings');
            Route::get('/dashboard-stats', [AdminDashboardController::class, 'stats'])->name('api.v1.admin.dashboard-stats');
            Route::get('/dashboard', [AdminDashboardController::class, 'stats'])->name('api.v1.admin.dashboard');
            Route::get('/delete-account-requests', [AdminAccountDeletionRequestsController::class, 'index'])->name('api.v1.admin.delete-account-requests.index');
            Route::put('/delete-account-requests/{requestId}', [AdminAccountDeletionRequestsController::class, 'update'])->name('api.v1.admin.delete-account-requests.update');
            Route::get('/categories', [AdminCategoryController::class, 'index'])->name('api.v1.admin.categories.index');
            Route::post('/categories', [AdminCategoryController::class, 'store'])->name('api.v1.admin.categories.store');
            Route::post('/categories/reorder', [AdminCategoryController::class, 'reorder'])->name('api.v1.admin.categories.reorder');
            Route::get('/categories/{category}', [AdminCategoryController::class, 'show'])->name('api.v1.admin.categories.show');
            Route::patch('/categories/{category}', [AdminCategoryController::class, 'update'])->name('api.v1.admin.categories.update');
            Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy'])->name('api.v1.admin.categories.destroy');
            Route::post('/categories/{category}/archive', [AdminCategoryController::class, 'archive'])->name('api.v1.admin.categories.archive');
            Route::post('/categories/{category}/restore', [AdminCategoryController::class, 'restore'])->name('api.v1.admin.categories.restore');
            Route::get('/categories/{category}/aliases', [AdminCategoryAliasController::class, 'index'])->name('api.v1.admin.categories.aliases.index');
            Route::post('/categories/{category}/aliases', [AdminCategoryAliasController::class, 'store'])->name('api.v1.admin.categories.aliases.store');
            Route::delete('/category-aliases/{alias}', [AdminCategoryAliasController::class, 'destroy'])->name('api.v1.admin.category-aliases.destroy');
            Route::get('/brands', [AdminBrandController::class, 'index'])->name('api.v1.admin.brands.index');
            Route::post('/brands', [AdminBrandController::class, 'store'])->name('api.v1.admin.brands.store');
            Route::get('/brands/{brand}', [AdminBrandController::class, 'show'])->name('api.v1.admin.brands.show');
            Route::patch('/brands/{brand}', [AdminBrandController::class, 'update'])->name('api.v1.admin.brands.update');
            Route::delete('/brands/{brand}', [AdminBrandController::class, 'destroy'])->name('api.v1.admin.brands.destroy');
            Route::get('/products', [AdminProductController::class, 'index'])->name('api.v1.admin.products.index');
            Route::post('/products', [AdminProductController::class, 'store'])->name('api.v1.admin.products.store');
            Route::get('/products/{product}', [AdminProductController::class, 'show'])->name('api.v1.admin.products.show');
            Route::patch('/products/{product}', [AdminProductController::class, 'update'])->name('api.v1.admin.products.update');
            Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])->name('api.v1.admin.products.destroy');
            Route::post('/products/{product}/publish', [AdminProductController::class, 'publish'])->name('api.v1.admin.products.publish');
            Route::post('/products/{product}/restore', [AdminProductController::class, 'restore'])->name('api.v1.admin.products.restore');
            Route::get('/products/{product}/variants', [AdminProductVariantController::class, 'index'])->name('api.v1.admin.products.variants.index');
            Route::post('/products/{product}/variants', [AdminProductVariantController::class, 'store'])->name('api.v1.admin.products.variants.store');
            Route::post('/products/{product}/variants/reorder', [AdminProductVariantController::class, 'reorder'])->name('api.v1.admin.products.variants.reorder');
            Route::patch('/product-variants/{variant}', [AdminProductVariantController::class, 'update'])->name('api.v1.admin.product-variants.update');
            Route::delete('/product-variants/{variant}', [AdminProductVariantController::class, 'destroy'])->name('api.v1.admin.product-variants.destroy');
            Route::post('/product-variants/{variant}/make-default', [AdminProductVariantController::class, 'makeDefault'])->name('api.v1.admin.product-variants.make-default');
            Route::get('/products/{product}/media', [AdminProductMediaController::class, 'index'])->name('api.v1.admin.products.media.index');
            Route::post('/products/{product}/media', [AdminProductMediaController::class, 'store'])->name('api.v1.admin.products.media.store');
            Route::post('/products/{product}/media/reorder', [AdminProductMediaController::class, 'reorder'])->name('api.v1.admin.products.media.reorder');
            Route::patch('/product-media/{media}', [AdminProductMediaController::class, 'update'])->name('api.v1.admin.product-media.update');
            Route::delete('/product-media/{media}', [AdminProductMediaController::class, 'destroy'])->name('api.v1.admin.product-media.destroy');
            Route::post('/product-media/{media}/make-primary', [AdminProductMediaController::class, 'makePrimary'])->name('api.v1.admin.product-media.make-primary');
            Route::get('/media-storage/status', [AdminMediaUploadController::class, 'status'])->name('api.v1.admin.media-storage.status');
            Route::post('/media-uploads', [AdminMediaUploadController::class, 'store'])->name('api.v1.admin.media-uploads.store');
            Route::post('/media-uploads/{mediaUpload}/complete', [AdminMediaUploadController::class, 'complete'])->name('api.v1.admin.media-uploads.complete');
            Route::delete('/media-uploads/{mediaUpload}', [AdminMediaUploadController::class, 'destroy'])->name('api.v1.admin.media-uploads.destroy');
            Route::get('/products/{product}/nutrition-facts', [AdminProductNutritionFactController::class, 'show'])->name('api.v1.admin.products.nutrition.show');
            Route::put('/products/{product}/nutrition-facts', [AdminProductNutritionFactController::class, 'update'])->name('api.v1.admin.products.nutrition.update');
            Route::delete('/products/{product}/nutrition-facts', [AdminProductNutritionFactController::class, 'destroy'])->name('api.v1.admin.products.nutrition.destroy');
        });
    });

    Route::prefix('catalog')->group(function (): void {
        Route::get('/categories', [CategoryController::class, 'index'])->middleware('throttle:api')->name('api.v1.catalog.categories.index');
        Route::get('/categories/tree', [CategoryController::class, 'tree'])->middleware('throttle:api')->name('api.v1.catalog.categories.tree');
        Route::get('/categories/{category}', [CategoryController::class, 'show'])->middleware('throttle:api')->name('api.v1.catalog.categories.show');
        Route::get('/products', [ProductController::class, 'index'])->middleware('throttle:api')->name('api.v1.catalog.products.index');
        Route::get('/products/{product}', [ProductController::class, 'show'])->middleware('throttle:api')->name('api.v1.catalog.products.show');
        Route::get('/brands', [BrandController::class, 'index'])->middleware('throttle:api')->name('api.v1.catalog.brands.index');
    });
});
