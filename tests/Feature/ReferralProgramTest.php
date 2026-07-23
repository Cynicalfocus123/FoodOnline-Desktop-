<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Promotion;
use App\Models\Referral;
use App\Models\ReferralCode;
use App\Models\ReferralReward;
use App\Models\User;
use App\Models\UserApiToken;
use App\Services\Commerce\PromotionService;
use App\Services\Referral\ReferralCodeService;
use App\Services\Referral\ReferralQualificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class ReferralProgramTest extends TestCase
{
    use CreatesAdminTokens;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ThrottleRequests::class);
        Mail::fake();
    }

    public function test_customer_invite_registration_dashboard_activity_and_coupons_are_authoritative(): void
    {
        $referrer = $this->registerCustomer('referrer@example.test');
        $code = ReferralCode::query()->where('user_id', $referrer['user']->id)->firstOrFail();

        $this->assertSame(1, ReferralCode::query()->where('user_id', $referrer['user']->id)->count());
        $this->getJson('/api/v1/referrals/invite/'.$code->code)
            ->assertOk()
            ->assertJsonPath('valid', true)
            ->assertJsonPath('referral_code', $code->code);

        $friend = $this->registerCustomer('friend@example.test', $code->code);
        $this->assertNotEmpty($friend['token']);
        $this->assertSame('customer', $friend['response']->json('user.account_type'));

        $referral = Referral::query()->where('referrer_user_id', $referrer['user']->id)->where('referred_user_id', $friend['user']->id)->firstOrFail();
        $this->assertSame(1, Referral::query()->where('referred_user_id', $friend['user']->id)->count());
        $this->assertDatabaseCount('referral_rewards', 2);

        $this->withToken($referrer['token'])->getJson('/api/v1/account/referrals')
            ->assertOk()
            ->assertJsonPath('invite.code', $code->code)
            ->assertJsonPath('stats.registered', 1)
            ->assertJsonPath('recent_activity.0.friend_name', 'F.');
        $this->withToken($referrer['token'])->getJson('/api/v1/account/referrals/activity')
            ->assertOk()
            ->assertJsonPath('data.0.id', $referral->uuid)
            ->assertJsonPath('data.0.friend_name', 'F.');
        $this->withToken($friend['token'])->getJson('/api/v1/account/referral-coupons')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $coupon = ReferralReward::query()->where('beneficiary_user_id', $friend['user']->id)->with('promotion')->firstOrFail()->promotion;
        $this->assertInstanceOf(Promotion::class, $coupon);
        $other = User::factory()->create(['role' => 'customer', 'status' => 'active']);
        $this->expectException(ValidationException::class);
        app(PromotionService::class)->evaluate($coupon->code, [], 0, 'USD', $other, null);
    }

    public function test_invalid_and_self_referral_codes_are_rejected_without_creating_an_attribution(): void
    {
        $this->postJson('/api/v1/auth/register', $this->registrationPayload('invalid-code@example.test', 'FOLZZZZZZ'))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('referral_code');
        $this->assertDatabaseCount('referrals', 0);

        $customer = User::factory()->create(['role' => 'customer', 'status' => 'active']);
        $code = app(ReferralCodeService::class)->ensure($customer);
        $this->assertNotNull($code);
        $this->expectException(ValidationException::class);
        app(\App\Services\Referral\ReferralAttributionService::class)->attributeRegisteredCustomer($customer, $code->code);
    }

    public function test_backfill_creates_only_customer_codes_and_is_idempotent(): void
    {
        $customer = User::factory()->create(['role' => 'customer', 'status' => 'active']);
        $supplier = User::factory()->create(['role' => 'supplier', 'status' => 'active']);
        $partner = User::factory()->create(['role' => 'partner', 'status' => 'active']);
        $existing = ReferralCode::query()->create(['user_id' => $customer->id, 'code' => 'FOLKEEP77', 'status' => 'active', 'generated_at' => now()]);
        $newCustomer = User::factory()->create(['role' => 'customer', 'status' => 'active']);

        $this->artisan('referrals:backfill-codes')->assertExitCode(0);
        $this->assertSame('FOLKEEP77', $existing->fresh()->code);
        $this->assertDatabaseCount('referral_codes', 2);
        $this->assertDatabaseMissing('referral_codes', ['user_id' => $supplier->id]);
        $this->assertDatabaseMissing('referral_codes', ['user_id' => $partner->id]);
        $this->assertDatabaseHas('referral_codes', ['user_id' => $newCustomer->id]);

        $this->artisan('referrals:backfill-codes')->assertExitCode(0);
        $this->assertDatabaseCount('referral_codes', 2);
    }

    public function test_qualification_is_idempotent_and_full_refund_revokes_the_account_bound_coupon(): void
    {
        $referrer = $this->registerCustomer('qualification-referrer@example.test');
        $code = ReferralCode::query()->where('user_id', $referrer['user']->id)->value('code');
        $friend = $this->registerCustomer('qualification-friend@example.test', $code);
        $order = Order::query()->create([
            'order_number' => 'RF-'.strtoupper(bin2hex(random_bytes(5))),
            'user_id' => $friend['user']->id,
            'actor_key' => 'referral-test-'.$friend['user']->id,
            'idempotency_key' => 'qualifying-order-'.bin2hex(random_bytes(6)),
            'order_status' => 'completed',
            'payment_status' => 'paid',
            'fulfillment_status' => 'delivered',
            'currency_code' => 'USD',
            'subtotal_minor' => 3000,
            'total_minor' => 3000,
            'paid_minor' => 3000,
            'payment_method_code' => 'cod',
            'placed_at' => now(),
            'delivered_at' => now(),
        ]);

        $qualification = app(ReferralQualificationService::class);
        $qualification->processOrder($order);
        $qualification->processOrder($order->fresh());

        $reward = ReferralReward::query()->where('qualifying_order_id', $order->id)->with('promotion')->firstOrFail();
        $this->assertSame('issued', $reward->status);
        $this->assertSame($referrer['user']->id, $reward->beneficiary_user_id);
        $this->assertNotNull($reward->promotion);
        $this->assertSame(1, ReferralReward::query()->where('qualifying_order_id', $order->id)->count());
        $this->assertDatabaseHas('notifications', ['notifiable_id' => $referrer['user']->id]);

        $order->update(['refunded_minor' => 3000]);
        $qualification->handleFullRefund($order->fresh());
        $this->assertSame('revoked', $reward->fresh()->status);
        $this->assertFalse((bool) $reward->promotion->fresh()->active);
        $this->assertDatabaseHas('notifications', ['notifiable_id' => $referrer['user']->id]);
    }

    public function test_admin_referral_list_detail_settings_and_audit_are_available(): void
    {
        $referrer = $this->registerCustomer('admin-referrer@example.test');
        $code = ReferralCode::query()->where('user_id', $referrer['user']->id)->value('code');
        $friend = $this->registerCustomer('admin-friend@example.test', $code);
        $referral = Referral::query()->where('referred_user_id', $friend['user']->id)->firstOrFail();
        [, $adminToken] = $this->adminToken();

        $this->withToken($adminToken)->getJson('/api/v1/admin/referrals?search=admin-referrer@example.test')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $referral->uuid);
        $this->withToken($adminToken)->getJson('/api/v1/admin/referrals/'.$referral->uuid)
            ->assertOk()
            ->assertJsonPath('referral.id', $referral->uuid)
            ->assertJsonStructure(['referral' => ['referrer', 'referred', 'rewards']]);
        $this->withToken($adminToken)->getJson('/api/v1/admin/referral-settings')
            ->assertOk()
            ->assertJsonPath('program.status', 'active');
        $this->withToken($adminToken)->putJson('/api/v1/admin/referral-settings', ['status' => 'paused'])
            ->assertOk()
            ->assertJsonPath('program.status', 'paused');
        $this->withToken($adminToken)->putJson('/api/v1/admin/referral-settings', ['currency_code' => 'TOOLONG'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('currency_code');
        $this->withToken($adminToken)->postJson('/api/v1/admin/referrals/'.$referral->uuid.'/actions', ['action' => 'review'])
            ->assertOk()
            ->assertJsonPath('referral.review_status', 'under_review');
        $this->assertDatabaseHas('admin_audit_logs', ['action' => 'referral.settings.updated']);
        $this->assertDatabaseHas('admin_audit_logs', ['action' => 'referral.review']);
    }

    public function test_missing_referral_schema_returns_controlled_referral_errors_while_core_flows_still_work(): void
    {
        $customer = $this->registerCustomer('schema-customer@example.test');
        [, $adminToken] = $this->adminToken();
        foreach (['referral_rewards', 'referrals', 'referral_codes', 'referral_programs'] as $table) {
            Schema::dropIfExists($table);
        }

        $this->getJson('/api/v1/referrals/invite/FOLAAAAAA')->assertStatus(503)->assertJsonPath('message', 'Referral services are temporarily unavailable. Please try again later.');
        $this->withToken($customer['token'])->getJson('/api/v1/account/referrals')->assertStatus(503);
        $this->withToken($adminToken)->getJson('/api/v1/admin/referrals')->assertStatus(503);
        $this->withToken($adminToken)->getJson('/api/v1/admin/referrals/not-a-real-referral')->assertStatus(503);
        $this->registerCustomer('schema-still-registers@example.test');
    }

    /** @return array{response: \Illuminate\Testing\TestResponse, token: string, user: User} */
    private function registerCustomer(string $email, ?string $referralCode = null): array
    {
        $response = $this->postJson('/api/v1/auth/register', $this->registrationPayload($email, $referralCode))->assertCreated();
        $user = User::query()->where('email', $email)->firstOrFail();

        return ['response' => $response, 'token' => (string) $response->json('token'), 'user' => $user];
    }

    /** @return array<string, string> */
    private function registrationPayload(string $email, ?string $referralCode = null): array
    {
        return array_filter([
            'account_type' => 'customer',
            'email' => $email,
            'first_name' => 'Friend',
            'last_name' => 'Customer',
            'contact_number' => '+66 81 555 1234',
            'password' => 'Strongpass123',
            'registered_from' => 'referral-feature-test',
            'referral_code' => $referralCode,
        ], fn ($value) => $value !== null);
    }
}
