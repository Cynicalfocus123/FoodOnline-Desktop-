<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('return_requests', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('return_number', 32)->unique();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_access_token_hash', 64)->nullable()->index();
            $table->string('status', 32)->index();
            $table->string('requested_resolution', 32);
            $table->string('reason_code', 40);
            $table->text('customer_explanation')->nullable();
            $table->text('admin_decision_reason')->nullable();
            $table->string('refund_status', 32)->default('not_requested')->index();
            $table->unsignedBigInteger('refund_amount_minor')->default(0);
            $table->string('currency_code', 3);
            $table->timestamp('requested_at');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->index(['order_id', 'status']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('return_request_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('return_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_item_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('quantity_requested');
            $table->unsignedInteger('quantity_approved')->default(0);
            $table->unsignedInteger('quantity_received')->default(0);
            $table->string('condition_code', 32)->nullable();
            $table->text('inspection_notes')->nullable();
            $table->unsignedInteger('restock_quantity')->default(0);
            $table->string('non_restock_reason', 80)->nullable();
            $table->string('resolution', 32)->default('pending');
            $table->timestamps();
            $table->unique(['return_request_id', 'order_item_id']);
        });

        Schema::create('product_reviews', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_item_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->string('title', 180)->nullable();
            $table->text('body')->nullable();
            $table->string('status', 24)->default('pending')->index();
            $table->boolean('verified_purchase')->default(false)->index();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('edited_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['user_id', 'product_id']);
            $table->index(['product_id', 'status', 'published_at']);
        });

        Schema::create('review_media', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('product_review_id')->constrained()->cascadeOnDelete();
            $table->foreignId('media_upload_id')->nullable()->constrained()->nullOnDelete();
            $table->string('path', 500);
            $table->string('alt_text', 180)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['product_review_id', 'sort_order']);
        });

        Schema::create('review_helpful_votes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_review_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['product_review_id', 'user_id']);
        });

        Schema::create('review_reports', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('product_review_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reason_code', 40);
            $table->text('details')->nullable();
            $table->string('status', 24)->default('open')->index();
            $table->text('moderator_note')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->unique(['product_review_id', 'user_id']);
        });

        Schema::create('user_favorites', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'product_id']);
        });

        Schema::create('user_saved_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();
            $table->unique(['user_id', 'product_variant_id']);
        });

        Schema::create('support_tickets', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('ticket_number', 32)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_email', 254)->nullable();
            $table->string('subject', 180);
            $table->string('status', 24)->default('open')->index();
            $table->string('priority', 16)->default('normal');
            $table->timestamp('last_message_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        Schema::create('support_messages', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('support_ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('admin_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('body');
            $table->json('attachments')->nullable();
            $table->boolean('customer_visible')->default(true);
            $table->timestamps();
            $table->index(['support_ticket_id', 'created_at']);
        });

        Schema::create('notifications', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index(['notifiable_type', 'notifiable_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('support_messages');
        Schema::dropIfExists('support_tickets');
        Schema::dropIfExists('user_saved_items');
        Schema::dropIfExists('user_favorites');
        Schema::dropIfExists('review_reports');
        Schema::dropIfExists('review_helpful_votes');
        Schema::dropIfExists('review_media');
        Schema::dropIfExists('product_reviews');
        Schema::dropIfExists('return_request_items');
        Schema::dropIfExists('return_requests');
    }
};
