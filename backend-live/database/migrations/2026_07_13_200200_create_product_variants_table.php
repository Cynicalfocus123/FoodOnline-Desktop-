<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('title', 150);
            $table->string('sku', 100)->unique();
            $table->string('gtin', 14)->nullable()->unique();
            $table->string('size_label', 100)->nullable();
            $table->decimal('net_content_value', 12, 3)->nullable();
            $table->string('net_content_unit', 10)->nullable();
            $table->unsignedInteger('pack_count')->default(1);
            $table->string('package_type', 20)->nullable();
            $table->decimal('price_amount', 12, 2);
            $table->decimal('compare_at_price_amount', 12, 2)->nullable();
            $table->char('currency_code', 3);
            $table->string('availability_status', 20)->default('in_stock');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['product_id', 'is_active', 'sort_order']);
            $table->index(['product_id', 'is_default']);
            $table->index(['availability_status', 'is_active']);
            $table->index('price_amount');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
