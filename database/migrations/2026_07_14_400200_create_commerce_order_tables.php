<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('order_number', 40)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_email')->nullable()->index();
            $table->string('guest_phone', 40)->nullable();
            $table->char('guest_access_token_hash', 64)->nullable()->unique();
            $table->foreignId('checkout_quote_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('cart_id')->nullable()->constrained()->nullOnDelete();
            $table->string('actor_key', 80);
            $table->string('idempotency_key', 100);
            $table->string('order_status', 20)->index();
            $table->string('payment_status', 24)->index();
            $table->string('fulfillment_status', 24)->index();
            $table->char('currency_code', 3);
            $table->unsignedBigInteger('retail_subtotal_minor')->default(0);
            $table->unsignedBigInteger('product_discount_minor')->default(0);
            $table->unsignedBigInteger('subtotal_minor');
            $table->unsignedBigInteger('promo_discount_minor')->default(0);
            $table->unsignedBigInteger('shipping_minor')->default(0);
            $table->unsignedBigInteger('cod_fee_minor')->default(0);
            $table->unsignedBigInteger('tax_minor')->default(0);
            $table->unsignedBigInteger('total_minor');
            $table->unsignedBigInteger('paid_minor')->default(0);
            $table->unsignedBigInteger('refunded_minor')->default(0);
            $table->string('payment_method_code', 40);
            $table->string('shipping_method_code', 40)->nullable();
            $table->string('carrier_name')->nullable();
            $table->string('tracking_number')->nullable()->index();
            $table->string('promotion_code_snapshot', 64)->nullable();
            $table->json('promotion_snapshot')->nullable();
            $table->text('customer_note')->nullable();
            $table->text('internal_note')->nullable();
            $table->timestamp('placed_at')->index();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
            $table->unique(['actor_key', 'idempotency_key']);
        });

        Schema::create('order_items', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->uuid('product_uuid');
            $table->string('product_slug', 160);
            $table->string('product_name');
            $table->text('product_image_url')->nullable();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->uuid('variant_uuid');
            $table->string('variant_title', 150);
            $table->string('sku', 100);
            $table->string('gtin', 14)->nullable();
            $table->string('package_size', 100)->nullable();
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('unit_price_minor');
            $table->unsignedBigInteger('old_unit_price_minor')->nullable();
            $table->unsignedBigInteger('product_discount_minor')->default(0);
            $table->unsignedBigInteger('promo_discount_minor')->default(0);
            $table->unsignedBigInteger('line_subtotal_minor');
            $table->unsignedBigInteger('line_total_minor');
            $table->char('currency_code', 3);
            $table->timestamps();
        });

        Schema::create('order_addresses', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('address_type', 20);
            $table->string('full_name');
            $table->string('phone_number', 40);
            $table->string('country_key', 40);
            $table->json('address_values');
            $table->text('summary');
            $table->text('delivery_note')->nullable();
            $table->timestamps();
            $table->unique(['order_id', 'address_type']);
        });

        Schema::create('order_payments', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('method_code', 40);
            $table->string('provider')->nullable();
            $table->string('provider_payment_id')->nullable()->index();
            $table->string('provider_customer_id')->nullable();
            $table->string('provider_payment_method_id')->nullable();
            $table->string('status', 24)->index();
            $table->unsignedBigInteger('amount_minor');
            $table->char('currency_code', 3);
            $table->string('card_brand', 40)->nullable();
            $table->string('card_last4', 4)->nullable();
            $table->string('failure_code')->nullable();
            $table->text('failure_message')->nullable();
            $table->timestamp('authorized_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->unsignedBigInteger('refunded_minor')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('payment_refunds', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('order_payment_id')->constrained()->restrictOnDelete();
            $table->string('provider_refund_id')->nullable()->index();
            $table->unsignedBigInteger('amount_minor');
            $table->char('currency_code', 3);
            $table->string('status', 24)->index();
            $table->string('reason');
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('requested_at');
            $table->timestamp('completed_at')->nullable();
            $table->text('failure_message')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('promotion_redemptions', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('promotion_id')->constrained()->restrictOnDelete();
            $table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_email')->nullable()->index();
            $table->string('code_snapshot', 64);
            $table->string('discount_type_snapshot', 20);
            $table->unsignedInteger('discount_value_snapshot');
            $table->unsignedBigInteger('discount_applied_minor');
            $table->char('currency_code', 3);
            $table->timestamp('redeemed_at');
            $table->timestamps();
        });

        Schema::create('order_status_history', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('actor_type', 20);
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->string('event_type', 60);
            $table->string('previous_order_status', 20)->nullable();
            $table->string('new_order_status', 20)->nullable();
            $table->string('previous_payment_status', 24)->nullable();
            $table->string('new_payment_status', 24)->nullable();
            $table->string('previous_fulfillment_status', 24)->nullable();
            $table->string('new_fulfillment_status', 24)->nullable();
            $table->text('customer_visible_message')->nullable();
            $table->text('internal_message')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['order_id', 'created_at']);
        });

        Schema::create('order_notes', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('admin_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('note_type', 30)->default('general');
            $table->text('body');
            $table->boolean('customer_visible')->default(false);
            $table->timestamps();
        });

        Schema::create('admin_audit_logs', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('admin_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 80)->index();
            $table->string('subject_type', 80);
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('before_payload')->nullable();
            $table->json('after_payload')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['subject_type', 'subject_id']);
        });

        Schema::table('inventory_reservations', function (Blueprint $table): void {
            $table->foreign('order_id')->references('id')->on('orders')->nullOnDelete();
        });
        Schema::table('inventory_movements', function (Blueprint $table): void {
            $table->foreign('order_id')->references('id')->on('orders')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('inventory_movements', function (Blueprint $table): void {
            $table->dropForeign(['order_id']);
        });
        Schema::table('inventory_reservations', function (Blueprint $table): void {
            $table->dropForeign(['order_id']);
        });
        Schema::dropIfExists('admin_audit_logs');
        Schema::dropIfExists('order_notes');
        Schema::dropIfExists('order_status_history');
        Schema::dropIfExists('promotion_redemptions');
        Schema::dropIfExists('payment_refunds');
        Schema::dropIfExists('order_payments');
        Schema::dropIfExists('order_addresses');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
