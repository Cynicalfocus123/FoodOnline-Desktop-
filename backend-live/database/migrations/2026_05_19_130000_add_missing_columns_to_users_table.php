<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $addedRole = false;
            $addedStatus = false;

            if (! Schema::hasColumn('users', 'first_name')) {
                $table->string('first_name')->nullable();
            }

            if (! Schema::hasColumn('users', 'last_name')) {
                $table->string('last_name')->nullable();
            }

            if (! Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable();
            }

            if (! Schema::hasColumn('users', 'company_name')) {
                $table->string('company_name')->nullable();
            }

            if (! Schema::hasColumn('users', 'business_type')) {
                $table->string('business_type')->nullable();
            }

            if (! Schema::hasColumn('users', 'registered_from')) {
                $table->string('registered_from')->nullable();
            }

            if (! Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('customer');
                $addedRole = true;
            }

            if (! Schema::hasColumn('users', 'status')) {
                $table->string('status')->default('active');
                $addedStatus = true;
            }

            if ($addedRole) {
                $table->index('role');
            }

            if ($addedStatus) {
                $table->index('status');
            }
        });
    }

    public function down(): void
    {
        // Intentionally left blank.
        // Safe production rollback should be handled manually to avoid deleting live user data.
    }
};
