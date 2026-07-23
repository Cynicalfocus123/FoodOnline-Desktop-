<?php

use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\Referral;
use App\Models\ReferralCode;
use App\Models\ReferralReward;
use App\Models\User;
use App\Services\Referral\ReferralQualificationService;
use Illuminate\Contracts\Console\Kernel;

require dirname(__DIR__, 2).'/vendor/autoload.php';

$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$action = $argv[1] ?? '';

if ($action === 'seed-admin') {
    [$email, $password] = [$argv[2] ?? '', $argv[3] ?? ''];
    if ($email === '' || $password === '') {
        fwrite(STDERR, "Email and password are required.\n");
        exit(1);
    }
    User::query()->updateOrCreate(['email' => $email], [
        'name' => 'Referral Acceptance Admin', 'first_name' => 'Referral', 'last_name' => 'Admin',
        'role' => 'admin', 'status' => 'active', 'password' => $password,
    ]);
    echo json_encode(['result' => 'seeded']).PHP_EOL;
    exit(0);
}

if ($action === 'inspect') {
    $referrerEmail = $argv[2] ?? '';
    $friendEmail = $argv[3] ?? '';
    $referrer = User::query()->where('email', $referrerEmail)->firstOrFail();
    $friend = User::query()->where('email', $friendEmail)->firstOrFail();
    $referral = Referral::query()->where('referrer_user_id', $referrer->id)->where('referred_user_id', $friend->id)->with('rewards.promotion')->firstOrFail();
    echo json_encode([
        'referrer_id' => $referrer->id,
        'friend_id' => $friend->id,
        'code' => ReferralCode::query()->where('user_id', $referrer->id)->value('code'),
        'referral_id' => $referral->uuid,
        'referral_count' => Referral::query()->where('referred_user_id', $friend->id)->count(),
        'friend_rewards' => ReferralReward::query()->where('beneficiary_user_id', $friend->id)->count(),
        'referrer_rewards' => ReferralReward::query()->where('beneficiary_user_id', $referrer->id)->count(),
    ], JSON_THROW_ON_ERROR).PHP_EOL;
    exit(0);
}

if ($action === 'qualify-and-revoke') {
    $friendEmail = $argv[2] ?? '';
    $friend = User::query()->where('email', $friendEmail)->firstOrFail();
    $order = Order::query()->create([
        'order_number' => 'RA-'.strtoupper(bin2hex(random_bytes(5))), 'user_id' => $friend->id,
        'actor_key' => 'referral-acceptance-'.$friend->id, 'idempotency_key' => 'acceptance-'.bin2hex(random_bytes(8)),
        'order_status' => 'completed', 'payment_status' => 'paid', 'fulfillment_status' => 'delivered', 'currency_code' => 'USD',
        'subtotal_minor' => 3000, 'total_minor' => 3000, 'paid_minor' => 3000, 'payment_method_code' => 'cod',
        'placed_at' => now(), 'delivered_at' => now(),
    ]);
    OrderPayment::query()->create(['order_id' => $order->id, 'method_code' => 'cod', 'status' => 'paid', 'amount_minor' => 3000, 'currency_code' => 'USD', 'paid_at' => now()]);
    $service = app(ReferralQualificationService::class);
    $service->processOrder($order);
    $service->processOrder($order->fresh());
    $reward = ReferralReward::query()->where('qualifying_order_id', $order->id)->with('promotion')->firstOrFail();
    $issued = ['status' => $reward->status, 'coupon_code' => $reward->promotion?->code, 'reward_count' => ReferralReward::query()->where('qualifying_order_id', $order->id)->count()];
    $order->update(['refunded_minor' => 3000]);
    $service->handleFullRefund($order->fresh());
    $reward->refresh();
    echo json_encode(['issued' => $issued, 'revoked_status' => $reward->status, 'coupon_active' => (bool) $reward->promotion?->fresh()?->active], JSON_THROW_ON_ERROR).PHP_EOL;
    exit(0);
}

fwrite(STDERR, "Unknown referral acceptance action.\n");
exit(1);
