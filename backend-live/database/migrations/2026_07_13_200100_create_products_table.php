<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('slug', 160)->unique();
            $table->text('description')->nullable();
            $table->char('country_of_origin_code', 2)->nullable();
            $table->string('storage_type', 20)->nullable();
            $table->text('ingredients_text')->nullable();
            $table->text('allergen_statement')->nullable();
            $table->text('storage_instructions')->nullable();
            $table->string('status', 20)->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['category_id', 'status', 'published_at']);
            $table->index(['brand_id', 'status', 'published_at']);
            $table->index(['status', 'is_featured', 'published_at']);
            $table->index(['country_of_origin_code', 'status']);
            $table->index(['storage_type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
