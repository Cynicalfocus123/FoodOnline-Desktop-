<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Promotion;
use App\Models\Referral;
use App\Models\ReferralCode;
use App\Models\ReferralReward;
use App\Models\User;
use App\Services\Commerce\PromotionService;
use App\Services\Referral\ReferralAttributionService;
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

    private const ROLES = ['customer', 'supplier', 'partner'];

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ThrottleRequests::class);
        Mail::fake();
    }

    public function test_every_public_account_type_receives_a_stable_code_and_all_nine_registration_combinations_are_attributed(): void
    {
        $referrers = [];
        foreach (self::ROLES as $role) {
            $referrers[$role] = $this->registerAccount($role, "{$role}-referrer@example.test");
            $code = ReferralCode::query()->where('user_id', $referrers[$role]['user']->id)->firstOrFail();
            $this->assertNotSame('', $code->code);
            $this->assertSame($code->code, app(ReferralCodeService::class)->ensure($referrers[$role]['user'])->code);
            $this->getJson('/api/v1/referrals/invite/'.$code->code)->assertOk()->assertJsonPath('valid', true)->assertJsonPath('referral_code', $code->code);
        }

        foreach (self::ROLES as $referrerRole) {
            $code = ReferralCode::query()->where('user_id', $referrers[$referrerRole]['user']->id)->value('code');
            foreach (self::ROLES as $referredRole) {
                $friend = $this->registerAccount($referredRole, "{$referrerRole}-to-{$referredRole}@example.test", $code);
                $this->assertNotSame('', $friend['token']);
                $this->assertSame($referredRole, $friend['response']->json('user.account_type'));
                $this->withToken($friend['token'])->getJson('/api/v1/auth/me')->assertOk()->assertJsonPath('user.account_type', $referredRole);
                $this->assertDatabaseHas('referrals', ['referrer_user_id' => $referrers[$referrerRole]['user']->id, 'referred_user_id' => $friend['user']->id]);
                $this->assertSame(1, Referral::query()->where('referred_user_id', $friend['user']->id)->count());
            }
        }

        $this->assertDatabaseCount('referrals', 9);
        foreach (self::ROLES as $role) {
            $dashboard = $this->withToken($referrers[$role]['token'])->getJson('/api/v1/account/referrals')->assertOk();
            $dashboard->assertJsonPath('invite.code', ReferralCode::query()->where('user_id', $referrers[$role]['user']->id)->value('code'))
                ->assertJsonPath('stats.registered', 3)
                ->assertJsonPath('recent_activity.0.friend_account_type', 'partner');
            $this->withToken($referrers[$role]['token'])->getJson('/api/v1/account/referrals/activity')->assertOk()->assertJsonCount(3, 'data');
            $this->withToken($referrers[$role]['token'])->getJson('/api/v1/account/referral-coupons')->assertOk();
        }
    }

    public function test_invalid_self_and_missing_schema_referral_paths_keep_registration_safe(): void
    {
        $this->postJson('/api/v1/auth/register', $this->registrationPayload('customer', 'invalid-code@example.test', 'FOLZZZZZZ'))
            ->assertUnprocessable()->assertJsonValidationErrors('referral_code');
        $customer = User::factory()->create(['role' => 'customer', 'status' => 'active']);
        $code = app(ReferralCodeService::class)->ensure($customer);
        $this->assertNotNull($code);
        $this->expectException(ValidationException::class);
        app(ReferralAttributionService::class)->attributeRegisteredAccount($customer, $code->code);
    }

    public function test_backfill_creates_codes_for_every_public_role_preserves_existing_codes_and_is_idempotent(): void
    {
        $customer = User::factory()->create(['role' => 'customer', 'status' => 'active']);
        $supplier = User::factory()->create(['role' => 'supplier', 'status' => 'active']);
        $partner = User::factory()->create(['role' => 'partner', 'status' => 'active']);
        $newCustomer = User::factory()->create(['role' => 'customer', 'status' => 'active']);
        $existing = ReferralCode::query()->create(['user_id' => $customer->id, 'code' => 'FOLKEEP77', 'status' => 'active', 'generated_at' => now()]);

        $this->artisan('referrals:backfill-codes')->expectsOutput('Customer codes created: 1')->expectsOutput('Supplier codes created: 1')->expectsOutput('Partner codes created: 1')->assertExitCode(0);
        $this->assertSame('FOLKEEP77', $existing->fresh()->code);
        foreach ([$supplier, $partner, $newCustomer] as $user) $this->assertDatabaseHas('referral_codes', ['user_id' => $user->id]);
        $this->assertDatabaseCount('referral_codes', 4);

        $this->artisan('referrals:backfill-codes')->expectsOutput('Total codes created: 0')->assertExitCode(0);
        $this->assertDatabaseCount('referral_codes', 4);
        $this->assertSame(4, ReferralCode::query()->distinct('code')->count('code'));
    }

    public function test_qualification_reward_coupon_ownership_and_full_refund_revocation_work_for_non_customer_accounts(): void
    {
        $referrer = $this->registerAccount('supplier', 'qualification-referrer@example.test');
        $code = ReferralCode::query()->where('user_id', $referrer['user']->id)->value('code');
        $friend = $this->registerAccount('partner', 'qualification-friend@example.test', $code);
        $order = $this->qualifyingOrder($friend['user']);
        $qualification = app(ReferralQualificationService::class);
        $qualification->processOrder($order);
        $qualification->processOrder($order->fresh());

        $reward = ReferralReward::query()->where('qualifying_order_id', $order->id)->with('promotion')->firstOrFail();
        $this->assertSame('issued', $reward->status);
        $this->assertSame($referrer['user']->id, $reward->beneficiary_user_id);
        $this->assertInstanceOf(Promotion::class, $reward->promotion);
        $this->assertSame(1, ReferralReward::query()->where('qualifying_order_id', $order->id)->count());
        $other = User::factory()->create(['role' => 'customer', 'status' => 'active']);
        $this->expectException(ValidationException::class);
        app(PromotionService::class)->evaluate($reward->promotion->code, [], 0, 'USD', $other, null);
    }

    public function test_full_refund_revokes_the_account_bound_coupon_without_removing_referral_history(): void
    {
        $referrer = $this->registerAccount('partner', 'refund-referrer@example.test');
        $friend = $this->registerAccount('supplier', 'refund-friend@example.test', ReferralCode::query()->where('user_id', $referrer['user']->id)->value('code'));
        $order = $this->qualifyingOrder($friend['user']);
        $qualification = app(ReferralQualificationService::class);
        $qualification->processOrder($order);
        $reward = ReferralReward::query()->where('qualifying_order_id', $order->id)->with('promotion')->firstOrFail();
        $order->update(['refunded_minor' => 3000]);
        $qualification->handleFullRefund($order->fresh());
        $this->assertSame('revoked', $reward->fresh()->status);
        $this->assertFalse((bool) $reward->promotion->fresh()->active);
        $this->assertDatabaseCount('referrals', 1);
    }

    public function test_admin_referral_list_detail_filters_sections_actions_and_permissions_are_real(): void
    {
        $referrers = [];
        foreach (self::ROLES as $role) $referrers[$role] = $this->registerAccount($role, "admin-{$role}@example.test");
        $created = [];
        foreach (self::ROLES as $referrerRole) foreach (self::ROLES as $referredRole) $created[] = $this->registerAccount($referredRole, "admin-{$referrerRole}-{$referredRole}@example.test", ReferralCode::query()->where('user_id', $referrers[$referrerRole]['user']->id)->value('code'));
        $referral = Referral::query()->where('referred_user_id', $created[0]['user']->id)->firstOrFail();
        [, $adminToken] = $this->adminToken();

        $this->withToken($adminToken)->getJson('/api/v1/admin/referrals?referrer_account_type=customer&referred_account_type=partner')
            ->assertOk()->assertJsonPath('meta.total', 1)->assertJsonPath('data.0.id', Referral::query()->where('referred_user_id', $created[2]['user']->id)->value('uuid'))
            ->assertJsonPath('data.0.referrer.account_type', 'customer')->assertJsonPath('data.0.referred.account_type', 'partner');
        $this->withToken($adminToken)->getJson('/api/v1/admin/referrals/'.$referral->uuid)->assertOk()->assertJsonPath('referral.id', $referral->uuid)->assertJsonStructure(['referral' => ['referrer', 'referred', 'attribution', 'program']]);
        $this->withToken($adminToken)->getJson('/api/v1/admin/referrals/'.$referral->uuid.'/qualification')->assertOk()->assertJsonStructure(['qualification' => ['status', 'rule', 'first', 'second']]);
        $this->withToken($adminToken)->getJson('/api/v1/admin/referrals/'.$referral->uuid.'/rewards')->assertOk()->assertJsonStructure(['rewards']);
        $this->withToken($adminToken)->getJson('/api/v1/admin/referrals/'.$referral->uuid.'/audit-history')->assertOk()->assertJsonPath('data.0.action', 'Referral created');
        $this->withToken($adminToken)->getJson('/api/v1/admin/referrals/'.$referral->uuid.'/notifications')->assertOk()->assertJsonMissingPath('data.0.password')->assertJsonMissingPath('data.0.payload');
        $this->withToken($adminToken)->postJson('/api/v1/admin/referrals/'.$referral->uuid.'/actions', ['action' => 'review', 'reason' => 'Manual verification required.'])->assertOk()->assertJsonPath('referral.review_status', 'under_review');
        $this->withToken($adminToken)->postJson('/api/v1/admin/referrals/'.$referral->uuid.'/actions', ['action' => 'add_note', 'reason' => 'Verified account ownership.'])->assertOk()->assertJsonPath('referral.review_note', 'Verified account ownership.');
        $this->withToken($adminToken)->getJson('/api/v1/admin/referrals/'.$referral->uuid.'/audit-history')->assertOk()->assertJsonCount(3, 'data');
        $this->assertDatabaseHas('admin_audit_logs', ['action' => 'referral.review']);

        $this->withToken($created[0]['token'])->getJson('/api/v1/admin/referrals/'.$referral->uuid)->assertUnauthorized();
        [$restricted, $restrictedToken] = $this->adminToken();
        $restricted->update(['staff_role' => 'marketing_manager', 'staff_permissions' => []]);
        $this->withToken($restrictedToken)->postJson('/api/v1/admin/referrals/'.$referral->uuid.'/actions', ['action' => 'review', 'reason' => 'No access.'])->assertForbidden();
    }

    public function test_missing_shared_schema_returns_controlled_errors_while_all_public_roles_still_register(): void
    {
        foreach (['referral_rewards', 'referrals', 'referral_codes', 'referral_programs'] as $table) Schema::dropIfExists($table);
        foreach (self::ROLES as $role) $this->registerAccount($role, "schema-{$role}@example.test");
        [, $adminToken] = $this->adminToken();
        $this->getJson('/api/v1/referrals/invite/FOLAAAAAA')->assertStatus(503)->assertJsonPath('message', 'Referral services are temporarily unavailable. Please try again later.');
        $this->withToken($adminToken)->getJson('/api/v1/admin/referrals')->assertStatus(503);
    }

    /** @return array{response: \Illuminate\Testing\TestResponse, token: string, user: User} */
    private function registerAccount(string $role, string $email, ?string $referralCode = null): array
    {
        $response = $this->postJson('/api/v1/auth/register', $this->registrationPayload($role, $email, $referralCode))->assertCreated();
        return ['response' => $response, 'token' => (string) $response->json('token'), 'user' => User::query()->where('email', $email)->firstOrFail()];
    }

    /** @return array<string, string> */
    private function registrationPayload(string $role, string $email, ?string $referralCode = null): array
    {
        return array_filter(['account_type' => $role, 'email' => $email, 'first_name' => 'Referral', 'last_name' => ucfirst($role), 'contact_number' => '+66 81 555 1234', 'password' => 'Strongpass123', 'registered_from' => 'referral-feature-test', 'referral_code' => $referralCode], fn ($value) => $value !== null);
    }

    private function qualifyingOrder(User $user): Order
    {
        return Order::query()->create(['order_number' => 'RF-'.strtoupper(bin2hex(random_bytes(5))), 'user_id' => $user->id, 'actor_key' => 'referral-test-'.$user->id, 'idempotency_key' => 'qualifying-order-'.bin2hex(random_bytes(6)), 'order_status' => 'completed', 'payment_status' => 'paid', 'fulfillment_status' => 'delivered', 'currency_code' => 'USD', 'subtotal_minor' => 3000, 'total_minor' => 3000, 'paid_minor' => 3000, 'payment_method_code' => 'cod', 'placed_at' => now(), 'delivered_at' => now()]);
    }
}
