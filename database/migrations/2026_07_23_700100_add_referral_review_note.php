<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('referrals', 'review_note')) {
            return;
        }

        Schema::table('referrals', function (Blueprint $table): void {
            $table->text('review_note')->nullable()->after('reviewed_at');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('referrals', 'review_note')) {
            return;
        }

        Schema::table('referrals', function (Blueprint $table): void {
            $table->dropColumn('review_note');
        });
    }
};
