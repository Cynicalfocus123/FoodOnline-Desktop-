<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/*
 * Production databases can have the original referral migration recorded as
 * complete before later referral columns were introduced. This migration is
 * intentionally additive: it never drops, recreates, truncates, or changes
 * existing referral records. New nullable columns are backfilled where the
 * current application needs a stable identifier or state.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->createMissingTables();
        $this->addMissingColumns();
        $this->backfillRequiredValues();
        $this->ensureActiveProgram();
    }

    private function createMissingTables(): void
    {
        if (! Schema::hasTable('referral_programs')) {
            Schema::create('referral_programs', function (Blueprint $table): void {
                $table->id(); $table->uuid('uuid')->unique(); $table->string('name', 120); $table->string('status', 20)->default('draft')->index();
                $table->char('currency_code', 3)->default('USD'); $table->unsignedBigInteger('referrer_first_reward_minor')->default(0); $table->unsignedBigInteger('referrer_second_reward_minor')->default(0);
                $table->unsignedBigInteger('referee_first_discount_minor')->default(0); $table->unsignedBigInteger('referee_second_discount_minor')->default(0); $table->unsignedBigInteger('minimum_order_subtotal_minor')->default(0);
                $table->unsignedInteger('first_order_deadline_days')->default(90); $table->unsignedInteger('second_order_deadline_days')->default(180); $table->unsignedInteger('reward_expiration_days')->default(90);
                $table->unsignedInteger('maximum_successful_referrals_per_user')->nullable(); $table->unsignedInteger('maximum_referred_accounts_per_address')->nullable(); $table->unsignedInteger('attribution_days')->default(30);
                $table->boolean('manual_code_entry_enabled')->default(true); $table->boolean('require_verified_email')->default(false); $table->boolean('require_verified_phone')->default(false);
                $table->string('customer_heading', 160)->nullable(); $table->string('referrer_benefit_title', 160)->nullable(); $table->text('referrer_benefit_copy')->nullable();
                $table->string('referee_benefit_title', 160)->nullable(); $table->text('referee_benefit_copy')->nullable(); $table->string('invite_page_heading', 160)->nullable();
                $table->text('invite_page_copy')->nullable(); $table->text('share_message')->nullable(); $table->text('terms_content')->nullable();
                $table->timestamp('starts_at')->nullable()->index(); $table->timestamp('ends_at')->nullable()->index(); $table->timestamps();
            });
        }
        if (! Schema::hasTable('referral_codes')) {
            Schema::create('referral_codes', function (Blueprint $table): void {
                $table->id(); $table->uuid('uuid')->unique(); $table->unsignedBigInteger('user_id')->unique(); $table->string('code', 32)->unique();
                $table->string('status', 20)->default('active')->index(); $table->timestamp('generated_at'); $table->timestamp('disabled_at')->nullable(); $table->timestamps();
            });
        }
        if (! Schema::hasTable('referrals')) {
            Schema::create('referrals', function (Blueprint $table): void {
                $table->id(); $table->uuid('uuid')->unique(); $table->unsignedBigInteger('referral_program_id'); $table->unsignedBigInteger('referral_code_id');
                $table->unsignedBigInteger('referrer_user_id'); $table->unsignedBigInteger('referred_user_id')->unique(); $table->string('status', 24)->default('registered')->index();
                $table->timestamp('registered_at')->index(); $table->unsignedBigInteger('first_qualifying_order_id')->nullable(); $table->unsignedBigInteger('second_qualifying_order_id')->nullable();
                $table->timestamp('first_qualified_at')->nullable(); $table->timestamp('second_qualified_at')->nullable(); $table->timestamp('completed_at')->nullable();
                $table->timestamp('disqualified_at')->nullable(); $table->string('disqualification_reason', 500)->nullable(); $table->string('review_status', 24)->default('clear')->index();
                $table->unsignedBigInteger('reviewed_by')->nullable(); $table->timestamp('reviewed_at')->nullable(); $table->text('review_note')->nullable(); $table->json('program_snapshot')->nullable(); $table->timestamps();
                $table->index(['referrer_user_id', 'registered_at']); $table->index(['referral_program_id', 'status']);
            });
        }
        if (! Schema::hasTable('referral_rewards')) {
            Schema::create('referral_rewards', function (Blueprint $table): void {
                $table->id(); $table->uuid('uuid')->unique(); $table->unsignedBigInteger('referral_id'); $table->unsignedBigInteger('beneficiary_user_id'); $table->unsignedBigInteger('qualifying_order_id')->nullable();
                $table->string('milestone', 48); $table->string('reward_type', 32)->default('coupon'); $table->unsignedBigInteger('amount_minor')->default(0); $table->char('currency_code', 3)->default('USD');
                $table->string('status', 24)->default('pending')->index(); $table->unsignedBigInteger('promotion_id')->nullable(); $table->timestamp('issued_at')->nullable();
                $table->timestamp('expires_at')->nullable()->index(); $table->timestamp('redeemed_at')->nullable(); $table->timestamp('revoked_at')->nullable(); $table->unsignedBigInteger('revoked_by')->nullable();
                $table->string('revocation_reason', 500)->nullable(); $table->string('idempotency_key', 120)->unique(); $table->timestamps();
                $table->unique(['referral_id', 'milestone']); $table->index(['beneficiary_user_id', 'status']); $table->index(['qualifying_order_id', 'status']);
            });
        }
    }

    private function addMissingColumns(): void
    {
        $this->addColumns('referral_programs', [
            'uuid' => fn (Blueprint $t) => $t->uuid('uuid')->nullable(), 'status' => fn (Blueprint $t) => $t->string('status', 20)->default('draft'),
            'starts_at' => fn (Blueprint $t) => $t->timestamp('starts_at')->nullable(), 'ends_at' => fn (Blueprint $t) => $t->timestamp('ends_at')->nullable(),
        ]);
        $this->addColumns('referral_codes', [
            'uuid' => fn (Blueprint $t) => $t->uuid('uuid')->nullable(), 'user_id' => fn (Blueprint $t) => $t->unsignedBigInteger('user_id')->nullable(),
            'code' => fn (Blueprint $t) => $t->string('code', 32)->nullable(), 'status' => fn (Blueprint $t) => $t->string('status', 20)->default('active'),
        ]);
        $this->addColumns('referrals', [
            'uuid' => fn (Blueprint $t) => $t->uuid('uuid')->nullable(), 'referral_program_id' => fn (Blueprint $t) => $t->unsignedBigInteger('referral_program_id')->nullable(),
            'referral_code_id' => fn (Blueprint $t) => $t->unsignedBigInteger('referral_code_id')->nullable(), 'referrer_user_id' => fn (Blueprint $t) => $t->unsignedBigInteger('referrer_user_id')->nullable(),
            'referred_user_id' => fn (Blueprint $t) => $t->unsignedBigInteger('referred_user_id')->nullable(), 'status' => fn (Blueprint $t) => $t->string('status', 24)->default('registered'),
            'registered_at' => fn (Blueprint $t) => $t->timestamp('registered_at')->nullable(), 'review_status' => fn (Blueprint $t) => $t->string('review_status', 24)->default('clear'),
            'review_note' => fn (Blueprint $t) => $t->text('review_note')->nullable(),
        ]);
        $this->addColumns('referral_rewards', [
            'uuid' => fn (Blueprint $t) => $t->uuid('uuid')->nullable(), 'referral_id' => fn (Blueprint $t) => $t->unsignedBigInteger('referral_id')->nullable(),
            'beneficiary_user_id' => fn (Blueprint $t) => $t->unsignedBigInteger('beneficiary_user_id')->nullable(), 'qualifying_order_id' => fn (Blueprint $t) => $t->unsignedBigInteger('qualifying_order_id')->nullable(),
            'milestone' => fn (Blueprint $t) => $t->string('milestone', 48)->nullable(), 'status' => fn (Blueprint $t) => $t->string('status', 24)->default('pending'),
            'promotion_id' => fn (Blueprint $t) => $t->unsignedBigInteger('promotion_id')->nullable(), 'idempotency_key' => fn (Blueprint $t) => $t->string('idempotency_key', 120)->nullable(),
        ]);
    }

    /** @param array<string, Closure(Blueprint): mixed> $columns */
    private function addColumns(string $table, array $columns): void
    {
        foreach ($columns as $column => $definition) {
            if (! Schema::hasColumn($table, $column)) {
                Schema::table($table, fn (Blueprint $blueprint) => $definition($blueprint));
            }
        }
    }

    private function backfillRequiredValues(): void
    {
        foreach (['referral_programs', 'referral_codes', 'referrals', 'referral_rewards'] as $table) {
            foreach (DB::table($table)->whereNull('uuid')->orderBy('id')->pluck('id') as $id) {
                DB::table($table)->where('id', $id)->update(['uuid' => (string) Str::uuid()]);
            }
        }
        if (Schema::hasColumn('referrals', 'registered_at')) DB::table('referrals')->whereNull('registered_at')->update(['registered_at' => now()]);
        if (Schema::hasColumn('referrals', 'review_status')) DB::table('referrals')->whereNull('review_status')->update(['review_status' => 'clear']);
        if (Schema::hasColumn('referral_rewards', 'idempotency_key')) {
            foreach (DB::table('referral_rewards')->whereNull('idempotency_key')->orderBy('id')->pluck('id') as $id) {
                DB::table('referral_rewards')->where('id', $id)->update(['idempotency_key' => 'upgrade-'.$id.'-'.Str::lower(Str::random(24))]);
            }
        }
    }

    private function ensureActiveProgram(): void
    {
        if (DB::table('referral_programs')->exists()) {
            return;
        }

        $now = now();
        DB::table('referral_programs')->insert([
            'uuid' => (string) Str::uuid(), 'name' => 'FoodOnlines Refer & Earn', 'status' => 'active', 'currency_code' => 'USD',
            'referrer_first_reward_minor' => 1000, 'referrer_second_reward_minor' => 1000, 'referee_first_discount_minor' => 1000, 'referee_second_discount_minor' => 1000,
            'minimum_order_subtotal_minor' => 3000, 'first_order_deadline_days' => 90, 'second_order_deadline_days' => 180, 'reward_expiration_days' => 90,
            'attribution_days' => 30, 'manual_code_entry_enabled' => true, 'customer_heading' => 'Refer & Earn', 'starts_at' => $now, 'created_at' => $now, 'updated_at' => $now,
        ]);
    }

    public function down(): void
    {
        // Forward-only: production referral history must never be removed by rollback.
    }
};
