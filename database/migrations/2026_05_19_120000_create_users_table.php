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
            $table->string('first_name', 60);
            $table->string('last_name', 60);
            $table->string('email', 254)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->string('contact_number', 20);
            $table->string('line_id', 40)->nullable();
            $table->string('company_name', 120);
            $table->string('account_type', 20)->default('customer');
            $table->string('status', 20)->default('active');
            $table->string('registered_from', 50)->default('website');
            $table->rememberToken();
            $table->timestamps();

            $table->index(['account_type', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
