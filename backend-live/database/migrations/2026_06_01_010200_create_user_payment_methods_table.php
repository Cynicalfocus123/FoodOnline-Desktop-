<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('user_payment_methods')) {
            return;
        }

        Schema::create('user_payment_methods', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('provider', 40)->nullable();
            $table->string('brand', 40);
            $table->string('last4', 4);
            $table->unsignedTinyInteger('expiry_month');
            $table->unsignedSmallInteger('expiry_year');
            $table->string('token_reference', 191)->nullable();
            $table->boolean('is_default')->default(false);
            $table->string('status', 24)->default('active');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'is_default']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_payment_methods');
    }
};
