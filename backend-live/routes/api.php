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
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminInventoryController;
use App\Http\Controllers\Api\Admin\AdminPromotionController;
use App\Http\Controllers\Api\Admin\AdminCommerceSettingsController;
use App\Http\Controllers\Api\Admin\AdminAuditLogController;
use App\Http\Controllers\Api\Account\AccountDeletionRequestController;
use App\Http\Controllers\Api\Account\AddressBookController;
use App\Http\Controllers\Api\Account\NotificationPreferenceController;
use App\Http\Controllers\Api\Account\PasswordController;
use App\Http\Controllers\Api\Account\PaymentMethodController;
use App\Http\Controllers\Api\Account\OrderController as AccountOrderController;
use App\Http\Controllers\Api\Auth\CurrentUserController;
use App\Http\Controllers\Api\Auth\LoginUserController;
use App\Http\Controllers\Api\Auth\LogoutUserController;
use App\Http\Controllers\Api\Auth\RegisterUserController;
use App\Http\Controllers\Api\Auth\PasswordRecoveryController;
use App\Http\Controllers\Api\Auth\EmailVerificationController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\LocalMediaController;
use App\Http\Controllers\Api\Catalog\CategoryController;
use App\Http\Controllers\Api\Catalog\BrandController;
use App\Http\Controllers\Api\Catalog\ProductController;
use App\Http\Controllers\Api\Commerce\CartController;
use App\Http\Controllers\Api\Commerce\CheckoutController;
use App\Http\Controllers\Api\Commerce\OrderController;
use App\Http\Controllers\Api\Account\SavedDataController;
use App\Http\Controllers\Api\Account\ReturnRequestController;
use App\Http\Controllers\Api\Account\ReviewController as AccountReviewController;
use App\Http\Controllers\Api\Account\BuyAgainController;
use App\Http\Controllers\Api\Account\NotificationController as AccountNotificationController;
use App\Http\Controllers\Api\Account\SupportTicketController;
use App\Http\Controllers\Api\Account\SessionController;
use App\Http\Controllers\Api\Account\MediaUploadController as AccountMediaUploadController;
use App\Http\Controllers\Api\Account\ReceiptController;
use App\Http\Controllers\Api\Catalog\ReviewController as CatalogReviewController;
use App\Http\Controllers\Api\ReviewInteractionController;
use App\Http\Controllers\Api\Admin\AdminReturnController;
use App\Http\Controllers\Api\Admin\AdminReviewController;
use App\Http\Controllers\Api\Admin\AdminSupportController;
use App\Http\Controllers\Api\Admin\AdminReportController;
use App\Http\Controllers\Api\Admin\AdminOperationsController;
use App\Http\Controllers\Api\Admin\AdminSecurityController;
use App\Http\Controllers\Api\Admin\AdminFailedJobController;
use App\Http\Controllers\Api\Admin\AdminReferralController;
use App\Http\Controllers\Api\Account\ReferralController as AccountReferralController;
use App\Http\Controllers\Api\ReferralInvitationController;
use Illuminate\Support\Facades\Route;

Route::get('/media/{path}', LocalMediaController::class)
    ->where('path', '.+')
    ->middleware('throttle:api')
    ->name('api.media.show');

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
    Route::post('/auth/password/forgot', [PasswordRecoveryController::class, 'request'])->middleware(['throttle:api', 'throttle:login'])->name('api.v1.auth.password.forgot');
    Route::post('/auth/password/reset', [PasswordRecoveryController::class, 'reset'])->middleware(['throttle:api', 'throttle:login'])->name('api.v1.auth.password.reset');
    Route::post('/auth/email/verify', [EmailVerificationController::class, 'verify'])->middleware('throttle:api')->name('api.v1.auth.email.verify');
    Route::get('/referrals/invite/{referralCode}', ReferralInvitationController::class)
        ->middleware(['throttle:api', 'throttle:referral-public'])
        ->name('api.v1.referrals.invite');

    Route::middleware(['user.token', 'throttle:api'])->group(function (): void {
        Route::post('/auth/logout', LogoutUserController::class)->name('api.v1.auth.logout');
        Route::get('/auth/me', CurrentUserController::class)->name('api.v1.auth.me');
        Route::post('/auth/email/verification-notification', [EmailVerificationController::class, 'request'])->name('api.v1.auth.email.verification-notification');

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
        Route::get('/account/orders', [AccountOrderController::class, 'index'])->name('api.v1.account.orders.index');
        Route::get('/account/orders/{order}', [AccountOrderController::class, 'show'])->name('api.v1.account.orders.show');
        Route::post('/account/orders/{order}/cancel', [AccountOrderController::class, 'cancel'])->name('api.v1.account.orders.cancel');
        Route::get('/account/orders/{order}/receipt', [ReceiptController::class, 'show'])->name('api.v1.account.orders.receipt');
        Route::post('/cart/merge', [CartController::class, 'merge'])->name('api.v1.cart.merge');
        Route::get('/account/favorites', [SavedDataController::class, 'favorites'])->name('api.v1.account.favorites.index');
        Route::post('/account/favorites', [SavedDataController::class, 'favorite'])->name('api.v1.account.favorites.store');
        Route::delete('/account/favorites/{product}', [SavedDataController::class, 'removeFavorite'])->name('api.v1.account.favorites.destroy');
        Route::post('/account/favorites/merge', [SavedDataController::class, 'merge'])->name('api.v1.account.favorites.merge');
        Route::get('/account/saved-items', [SavedDataController::class, 'savedItems'])->name('api.v1.account.saved-items.index');
        Route::post('/account/saved-items', [SavedDataController::class, 'save'])->name('api.v1.account.saved-items.store');
        Route::delete('/account/saved-items/{variant}', [SavedDataController::class, 'removeSaved'])->name('api.v1.account.saved-items.destroy');
        Route::post('/account/saved-items/merge', [SavedDataController::class, 'merge'])->name('api.v1.account.saved-items.merge');
        Route::post('/account/saved-items/{variant}/move-to-cart', [SavedDataController::class, 'moveToCart'])->name('api.v1.account.saved-items.move');
        Route::get('/account/returns', [ReturnRequestController::class, 'index'])->name('api.v1.account.returns.index');
        Route::post('/account/returns', [ReturnRequestController::class, 'store'])->name('api.v1.account.returns.store');
        Route::get('/account/returns/{returnRequest}', [ReturnRequestController::class, 'show'])->name('api.v1.account.returns.show');
        Route::post('/account/returns/{returnRequest}/cancel', [ReturnRequestController::class, 'cancel'])->name('api.v1.account.returns.cancel');
        Route::get('/account/reviews', [AccountReviewController::class, 'index'])->name('api.v1.account.reviews.index');
        Route::post('/catalog/products/{product}/reviews', [AccountReviewController::class, 'store'])->name('api.v1.catalog.products.reviews.store');
        Route::patch('/account/reviews/{review}', [AccountReviewController::class, 'update'])->name('api.v1.account.reviews.update');
        Route::delete('/account/reviews/{review}', [AccountReviewController::class, 'destroy'])->name('api.v1.account.reviews.destroy');
        Route::get('/account/notifications', [AccountNotificationController::class, 'index'])->name('api.v1.account.notifications.index');
        Route::get('/account/referrals', [AccountReferralController::class, 'dashboard'])->middleware('throttle:referral-customer')->name('api.v1.account.referrals.dashboard');
        Route::get('/account/referrals/activity', [AccountReferralController::class, 'activity'])->middleware('throttle:referral-customer')->name('api.v1.account.referrals.activity');
        Route::get('/account/referral-coupons', [AccountReferralController::class, 'coupons'])->middleware('throttle:referral-customer')->name('api.v1.account.referrals.coupons');
        Route::post('/account/notifications/{notification}/read', [AccountNotificationController::class, 'read'])->name('api.v1.account.notifications.read');
        Route::post('/account/notifications/read-all', [AccountNotificationController::class, 'readAll'])->name('api.v1.account.notifications.read-all');
        Route::delete('/account/notifications/{notification}', [AccountNotificationController::class, 'destroy'])->name('api.v1.account.notifications.destroy');
        Route::get('/account/support-tickets', [SupportTicketController::class, 'index'])->name('api.v1.account.support.index');
        Route::post('/account/support-tickets', [SupportTicketController::class, 'store'])->name('api.v1.account.support.store');
        Route::get('/account/support-tickets/{ticket}', [SupportTicketController::class, 'show'])->name('api.v1.account.support.show');
        Route::post('/account/support-tickets/{ticket}/messages', [SupportTicketController::class, 'message'])->name('api.v1.account.support.message');
        Route::get('/account/sessions', [SessionController::class, 'index'])->name('api.v1.account.sessions.index');
        Route::delete('/account/sessions/{token}', [SessionController::class, 'destroy'])->name('api.v1.account.sessions.destroy');
        Route::get('/account/media-storage/status', [AccountMediaUploadController::class, 'status'])->name('api.v1.account.media-storage.status');
        Route::post('/account/media-uploads', [AccountMediaUploadController::class, 'store'])->name('api.v1.account.media-uploads.store');
        Route::post('/account/media-uploads/local', [AccountMediaUploadController::class, 'storeLocal'])->middleware('throttle:api')->name('api.v1.account.media-uploads.local');
        Route::post('/account/media-uploads/{mediaUpload}/complete', [AccountMediaUploadController::class, 'complete'])->name('api.v1.account.media-uploads.complete');
        Route::delete('/account/media-uploads/{mediaUpload}', [AccountMediaUploadController::class, 'destroy'])->name('api.v1.account.media-uploads.destroy');
        Route::post('/account/orders/{order}/buy-again', [BuyAgainController::class, 'store'])->name('api.v1.account.orders.buy-again');
        Route::post('/reviews/{review}/helpful', [ReviewInteractionController::class, 'helpful'])->name('api.v1.reviews.helpful');
        Route::delete('/reviews/{review}/helpful', [ReviewInteractionController::class, 'removeHelpful'])->name('api.v1.reviews.helpful.destroy');
        Route::post('/reviews/{review}/report', [ReviewInteractionController::class, 'report'])->name('api.v1.reviews.report');
    });

    Route::prefix('admin')->group(function (): void {
        Route::post('/login', [AdminAuthController::class, 'login'])
            ->middleware(['throttle:api', 'throttle:admin-login'])
            ->name('api.v1.admin.login');

        Route::middleware(['admin.token', 'throttle:api'])->group(function (): void {
            Route::post('/logout', [AdminAuthController::class, 'logout'])->name('api.v1.admin.logout');
            Route::get('/me', [AdminAuthController::class, 'me'])->name('api.v1.admin.me');
            Route::get('/users', [AdminUsersController::class, 'index'])->name('api.v1.admin.users');
            Route::post('/users', [AdminUsersController::class, 'store'])->name('api.v1.admin.users.store');
            Route::get('/users/{user}', [AdminUsersController::class, 'show'])->name('api.v1.admin.users.show');
            Route::patch('/users/{user}', [AdminUsersController::class, 'update'])->name('api.v1.admin.users.update');
            Route::delete('/users/{user}', [AdminUsersController::class, 'destroy'])->name('api.v1.admin.users.destroy');
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
            Route::post('/media-uploads/local', [AdminMediaUploadController::class, 'storeLocal'])->middleware('throttle:api')->name('api.v1.admin.media-uploads.local');
            Route::post('/media-uploads/{mediaUpload}/complete', [AdminMediaUploadController::class, 'complete'])->name('api.v1.admin.media-uploads.complete');
            Route::delete('/media-uploads/{mediaUpload}', [AdminMediaUploadController::class, 'destroy'])->name('api.v1.admin.media-uploads.destroy');
            Route::get('/products/{product}/nutrition-facts', [AdminProductNutritionFactController::class, 'show'])->name('api.v1.admin.products.nutrition.show');
            Route::put('/products/{product}/nutrition-facts', [AdminProductNutritionFactController::class, 'update'])->name('api.v1.admin.products.nutrition.update');
            Route::delete('/products/{product}/nutrition-facts', [AdminProductNutritionFactController::class, 'destroy'])->name('api.v1.admin.products.nutrition.destroy');
            Route::get('/orders', [AdminOrderController::class, 'index'])->name('api.v1.admin.orders.index');
            Route::get('/orders/{order}', [AdminOrderController::class, 'show'])->name('api.v1.admin.orders.show');
            Route::post('/orders/{order}/actions', [AdminOrderController::class, 'action'])->name('api.v1.admin.orders.action');
            Route::get('/inventory', [AdminInventoryController::class, 'index'])->name('api.v1.admin.inventory.index');
            Route::post('/inventory/{variant}/adjust', [AdminInventoryController::class, 'adjust'])->name('api.v1.admin.inventory.adjust');
            Route::get('/inventory/{variant}/movements', [AdminInventoryController::class, 'history'])->name('api.v1.admin.inventory.history');
            Route::get('/promo-codes', [AdminPromotionController::class, 'index'])->name('api.v1.admin.promotions.index');
            Route::post('/promo-codes', [AdminPromotionController::class, 'store'])->name('api.v1.admin.promotions.store');
            Route::get('/promo-codes/{promotion}', [AdminPromotionController::class, 'show'])->name('api.v1.admin.promotions.show');
            Route::patch('/promo-codes/{promotion}', [AdminPromotionController::class, 'update'])->name('api.v1.admin.promotions.update');
            Route::post('/promo-codes/{promotion}/archive', [AdminPromotionController::class, 'archive'])->name('api.v1.admin.promotions.archive');
            Route::get('/commerce-settings', [AdminCommerceSettingsController::class, 'show'])->name('api.v1.admin.commerce-settings.show');
            Route::put('/commerce-settings', [AdminCommerceSettingsController::class, 'update'])->name('api.v1.admin.commerce-settings.update');
            Route::get('/audit-logs', [AdminAuditLogController::class, 'index'])->name('api.v1.admin.audit-logs.index');
            Route::get('/referrals', [AdminReferralController::class, 'index'])->name('api.v1.admin.referrals.index');
            Route::get('/referral-settings', [AdminReferralController::class, 'settings'])->name('api.v1.admin.referrals.settings.show');
            Route::put('/referral-settings', [AdminReferralController::class, 'updateSettings'])->name('api.v1.admin.referrals.settings.update');
            Route::get('/referrals/{referral}', [AdminReferralController::class, 'show'])->name('api.v1.admin.referrals.show');
            Route::post('/referrals/{referral}/actions', [AdminReferralController::class, 'action'])->name('api.v1.admin.referrals.action');
            Route::get('/returns', [AdminReturnController::class, 'index'])->middleware('admin.permission:returns.view')->name('api.v1.admin.returns.index');
            Route::get('/returns/{returnRequest}', [AdminReturnController::class, 'show'])->middleware('admin.permission:returns.view')->name('api.v1.admin.returns.show');
            Route::post('/returns/{returnRequest}/actions', [AdminReturnController::class, 'action'])->middleware('admin.permission:returns.manage')->name('api.v1.admin.returns.action');
            Route::get('/reviews', [AdminReviewController::class, 'index'])->middleware('admin.permission:reviews.view')->name('api.v1.admin.reviews.index');
            Route::get('/reviews/{review}', [AdminReviewController::class, 'show'])->middleware('admin.permission:reviews.view')->name('api.v1.admin.reviews.show');
            Route::post('/reviews/{review}/actions', [AdminReviewController::class, 'action'])->middleware('admin.permission:reviews.moderate')->name('api.v1.admin.reviews.action');
            Route::get('/support-tickets', [AdminSupportController::class, 'index'])->middleware('admin.permission:support.view')->name('api.v1.admin.support.index');
            Route::get('/support-tickets/{ticket}', [AdminSupportController::class, 'show'])->middleware('admin.permission:support.view')->name('api.v1.admin.support.show');
            Route::post('/support-tickets/{ticket}/messages', [AdminSupportController::class, 'message'])->middleware('admin.permission:support.manage')->name('api.v1.admin.support.message');
            Route::post('/support-tickets/{ticket}/close', [AdminSupportController::class, 'close'])->middleware('admin.permission:support.manage')->name('api.v1.admin.support.close');
            Route::get('/reports/summary', [AdminReportController::class, 'summary'])->middleware('admin.permission:reports.view')->name('api.v1.admin.reports.summary');
            Route::get('/reports/orders.csv', [AdminReportController::class, 'ordersCsv'])->middleware('admin.permission:reports.export')->name('api.v1.admin.reports.orders');
            Route::get('/operations', [AdminOperationsController::class, 'show'])->middleware('admin.permission:dashboard.view')->name('api.v1.admin.operations.show');
            Route::get('/failed-jobs', [AdminFailedJobController::class, 'index'])->middleware('admin.permission:dashboard.view')->name('api.v1.admin.failed-jobs.index');
            Route::post('/failed-jobs/{uuid}/retry', [AdminFailedJobController::class, 'retry'])->middleware('admin.permission:dashboard.manage')->name('api.v1.admin.failed-jobs.retry');
            Route::get('/staff', [AdminSecurityController::class, 'staff'])->middleware('admin.permission:staff.view')->name('api.v1.admin.staff.index');
            Route::patch('/staff/{user}', [AdminSecurityController::class, 'updateStaff'])->middleware('admin.permission:staff.manage')->name('api.v1.admin.staff.update');
            Route::get('/staff/sessions', [AdminSecurityController::class, 'sessions'])->middleware('admin.permission:staff.view')->name('api.v1.admin.staff.sessions');
            Route::delete('/staff/sessions/{token}', [AdminSecurityController::class, 'revokeSession'])->middleware('admin.permission:staff.manage')->name('api.v1.admin.staff.sessions.revoke');
            Route::post('/mfa/setup', [AdminSecurityController::class, 'mfaSetup'])->middleware('admin.permission:staff.manage')->name('api.v1.admin.mfa.setup');
            Route::post('/mfa/enable', [AdminSecurityController::class, 'mfaEnable'])->middleware('admin.permission:staff.manage')->name('api.v1.admin.mfa.enable');
            Route::post('/mfa/disable', [AdminSecurityController::class, 'mfaDisable'])->middleware('admin.permission:staff.manage')->name('api.v1.admin.mfa.disable');
        });
    });

    Route::middleware(['user.optional', 'throttle:api'])->group(function (): void {
        Route::get('/cart', [CartController::class, 'show'])->name('api.v1.cart.show');
        Route::post('/cart/items', [CartController::class, 'store'])->name('api.v1.cart.items.store');
        Route::patch('/cart/items/{cartItem}', [CartController::class, 'update'])->name('api.v1.cart.items.update');
        Route::delete('/cart/items/{cartItem}', [CartController::class, 'destroy'])->name('api.v1.cart.items.destroy');
        Route::delete('/cart', [CartController::class, 'clear'])->name('api.v1.cart.clear');
        Route::get('/checkout/payment-methods', [CheckoutController::class, 'paymentMethods'])->name('api.v1.checkout.payment-methods');
        Route::post('/checkout/quote', [CheckoutController::class, 'quote'])->name('api.v1.checkout.quote');
        Route::post('/orders', [OrderController::class, 'store'])->name('api.v1.orders.store');
    });
    Route::get('/orders/{order}/guest', [OrderController::class, 'guestShow'])->middleware('throttle:api')->name('api.v1.orders.guest.show');

    Route::prefix('catalog')->group(function (): void {
        Route::get('/categories', [CategoryController::class, 'index'])->middleware('throttle:api')->name('api.v1.catalog.categories.index');
        Route::get('/categories/tree', [CategoryController::class, 'tree'])->middleware('throttle:api')->name('api.v1.catalog.categories.tree');
        Route::get('/categories/{category}', [CategoryController::class, 'show'])->middleware('throttle:api')->name('api.v1.catalog.categories.show');
        Route::get('/products', [ProductController::class, 'index'])->middleware('throttle:api')->name('api.v1.catalog.products.index');
        Route::get('/products/{product}', [ProductController::class, 'show'])->middleware('throttle:api')->name('api.v1.catalog.products.show');
        Route::get('/brands', [BrandController::class, 'index'])->middleware('throttle:api')->name('api.v1.catalog.brands.index');
        Route::get('/products/{product}/reviews', [CatalogReviewController::class, 'index'])->middleware('throttle:api')->name('api.v1.catalog.products.reviews.index');
        Route::get('/products/{product}/review-summary', [CatalogReviewController::class, 'summary'])->middleware('throttle:api')->name('api.v1.catalog.products.reviews.summary');
    });
});
