<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['user_api_tokens', 'admin_api_tokens'] as $tableName) {
            if (! Schema::hasTable($tableName) || Schema::hasColumn($tableName, 'expires_at')) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table): void {
                $table->timestamp('expires_at')->nullable()->after('last_used_at');
                $table->index(['expires_at', 'revoked_at']);
            });
        }
    }

    public function down(): void
    {
        foreach (['user_api_tokens', 'admin_api_tokens'] as $tableName) {
            if (! Schema::hasTable($tableName) || ! Schema::hasColumn($tableName, 'expires_at')) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropIndex(['expires_at', 'revoked_at']);
                $table->dropColumn('expires_at');
            });
        }
    }
};
