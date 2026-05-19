<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 121);
            $table->string('first_name', 60)->nullable();
            $table->string('last_name', 60)->nullable();
            $table->string('email', 254)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->string('role', 20)->default('customer');
            $table->string('phone', 20)->nullable();
            $table->string('line_id', 40)->nullable();
            $table->string('company_name', 120)->nullable();
            $table->string('business_type', 120)->nullable();
            $table->string('status', 20)->default('active');
            $table->string('registered_from', 50)->default('website');
            $table->rememberToken();
            $table->timestamps();

            $table->index(['role', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
