<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('staff_role', 32)->nullable()->after('role');
            $table->json('staff_permissions')->nullable()->after('staff_role');
            $table->text('mfa_secret')->nullable()->after('staff_permissions');
            $table->timestamp('mfa_enabled_at')->nullable()->after('mfa_secret');
            $table->timestamp('last_login_at')->nullable()->after('mfa_enabled_at');
        });

        Schema::table('admin_api_tokens', function (Blueprint $table): void {
            $table->string('ip_address', 45)->nullable()->after('name');
            $table->text('user_agent')->nullable()->after('ip_address');
            $table->timestamp('last_reauthenticated_at')->nullable()->after('last_used_at');
        });

        Schema::create('admin_recovery_codes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('code_hash', 64);
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'used_at']);
        });

        Schema::create('reauthentication_challenges', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('token_hash', 64)->unique();
            $table->string('purpose', 80);
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
        });

        Schema::create('operations_health_snapshots', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 80)->unique();
            $table->string('status', 24);
            $table->text('message')->nullable();
            $table->timestamp('last_checked_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->string('meta_title', 160)->nullable()->after('description');
            $table->string('meta_description', 320)->nullable()->after('meta_title');
            $table->string('canonical_url', 2048)->nullable()->after('meta_description');
            $table->boolean('robots_index')->default(true)->after('canonical_url');
            $table->boolean('robots_follow')->default(true)->after('robots_index');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->dropColumn(['meta_title', 'meta_description', 'canonical_url', 'robots_index', 'robots_follow']);
        });
        Schema::dropIfExists('operations_health_snapshots');
        Schema::dropIfExists('reauthentication_challenges');
        Schema::dropIfExists('admin_recovery_codes');
        Schema::table('admin_api_tokens', function (Blueprint $table): void {
            $table->dropColumn(['ip_address', 'user_agent', 'last_reauthenticated_at']);
        });
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['staff_role', 'staff_permissions', 'mfa_secret', 'mfa_enabled_at', 'last_login_at']);
        });
    }
};
