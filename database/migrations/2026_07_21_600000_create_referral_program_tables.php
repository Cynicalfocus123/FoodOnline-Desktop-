<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referral_programs', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name', 120);
            $table->string('status', 20)->default('draft')->index();
            $table->char('currency_code', 3);
            $table->unsignedBigInteger('referrer_first_reward_minor');
            $table->unsignedBigInteger('referrer_second_reward_minor');
            $table->unsignedBigInteger('referee_first_discount_minor');
            $table->unsignedBigInteger('referee_second_discount_minor');
            $table->unsignedBigInteger('minimum_order_subtotal_minor')->default(0);
            $table->unsignedInteger('first_order_deadline_days')->default(90);
            $table->unsignedInteger('second_order_deadline_days')->default(180);
            $table->unsignedInteger('reward_expiration_days')->default(90);
            $table->unsignedInteger('maximum_successful_referrals_per_user')->nullable();
            $table->unsignedInteger('maximum_referred_accounts_per_address')->nullable();
            $table->unsignedInteger('attribution_days')->default(30);
            $table->boolean('manual_code_entry_enabled')->default(true);
            $table->boolean('require_verified_email')->default(false);
            $table->boolean('require_verified_phone')->default(false);
            $table->string('customer_heading', 160)->nullable();
            $table->string('referrer_benefit_title', 160)->nullable();
            $table->text('referrer_benefit_copy')->nullable();
            $table->string('referee_benefit_title', 160)->nullable();
            $table->text('referee_benefit_copy')->nullable();
            $table->string('invite_page_heading', 160)->nullable();
            $table->text('invite_page_copy')->nullable();
            $table->text('share_message')->nullable();
            $table->text('terms_content')->nullable();
            $table->timestamp('starts_at')->nullable()->index();
            $table->timestamp('ends_at')->nullable()->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('referral_codes', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('code', 32)->unique();
            $table->string('status', 20)->default('active')->index();
            $table->timestamp('generated_at');
            $table->timestamp('disabled_at')->nullable();
            $table->timestamps();
        });

        Schema::create('referrals', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('referral_program_id')->constrained()->restrictOnDelete();
            $table->foreignId('referral_code_id')->constrained()->restrictOnDelete();
            $table->foreignId('referrer_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('referred_user_id')->unique()->constrained('users')->restrictOnDelete();
            $table->string('status', 24)->default('registered')->index();
            $table->timestamp('registered_at')->index();
            $table->foreignId('first_qualifying_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->foreignId('second_qualifying_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamp('first_qualified_at')->nullable();
            $table->timestamp('second_qualified_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('disqualified_at')->nullable();
            $table->string('disqualification_reason', 500)->nullable();
            $table->string('review_status', 24)->default('clear')->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->json('program_snapshot')->nullable();
            $table->timestamps();
            $table->index(['referrer_user_id', 'registered_at']);
            $table->index(['referral_program_id', 'status']);
        });

        Schema::create('referral_rewards', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('referral_id')->constrained()->restrictOnDelete();
            $table->foreignId('beneficiary_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('qualifying_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('milestone', 48);
            $table->string('reward_type', 32)->default('coupon');
            $table->unsignedBigInteger('amount_minor');
            $table->char('currency_code', 3);
            $table->string('status', 24)->default('pending')->index();
            $table->foreignId('promotion_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamp('redeemed_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('revoked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('revocation_reason', 500)->nullable();
            $table->string('idempotency_key', 120)->unique();
            $table->timestamps();
            $table->unique(['referral_id', 'milestone']);
            $table->index(['beneficiary_user_id', 'status']);
            $table->index(['qualifying_order_id', 'status']);
        });

        $now = now();
        DB::table('referral_programs')->insert([
            'uuid' => (string) Str::uuid(),
            'name' => 'FoodOnlines Refer & Earn',
            'status' => 'active',
            'currency_code' => 'USD',
            'referrer_first_reward_minor' => 1000,
            'referrer_second_reward_minor' => 1000,
            'referee_first_discount_minor' => 1000,
            'referee_second_discount_minor' => 1000,
            'minimum_order_subtotal_minor' => 3000,
            'first_order_deadline_days' => 90,
            'second_order_deadline_days' => 180,
            'reward_expiration_days' => 90,
            'attribution_days' => 30,
            'manual_code_entry_enabled' => true,
            'customer_heading' => 'Refer & Earn',
            'referrer_benefit_title' => 'You get referral coupons',
            'referrer_benefit_copy' => 'Receive a coupon after your friend\'s first qualifying order and another after their second qualifying order.',
            'referee_benefit_title' => 'Your friend gets referral coupons',
            'referee_benefit_copy' => 'New customers receive account-bound referral coupons after registering through an eligible invitation.',
            'invite_page_heading' => 'You have been invited to FoodOnlines',
            'invite_page_copy' => 'Create your account and receive a new-customer referral discount on qualifying orders.',
            'share_message' => 'Join FoodOnlines using my referral link and receive a new-customer discount on qualifying orders. I may also receive a FoodOnlines referral reward.',
            'terms_content' => 'Referred friends must be new FoodOnlines customers and may have only one referrer. Referral coupons are account-bound and non-transferable. Rewards are issued only after qualifying orders are delivered and payment is collected. Minimum orders, deadlines, expiration, review, and revocation rules are controlled by the active program.',
            'starts_at' => $now,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('referral_rewards');
        Schema::dropIfExists('referrals');
        Schema::dropIfExists('referral_codes');
        Schema::dropIfExists('referral_programs');
    }
};
