<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('user_notification_preferences')) {
            return;
        }

        Schema::create('user_notification_preferences', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->boolean('order_updates')->default(true);
            $table->boolean('delivery_updates')->default(true);
            $table->boolean('promotions_and_coupons')->default(true);
            $table->boolean('back_in_stock_alerts')->default(true);
            $table->boolean('saved_item_price_drops')->default(true);
            $table->boolean('email_notifications')->default(true);
            $table->boolean('sms_notifications')->default(false);
            $table->boolean('push_notifications')->default(true);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_notification_preferences');
    }
};
