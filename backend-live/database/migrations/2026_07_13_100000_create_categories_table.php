<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->restrictOnDelete();
            $table->string('name', 160);
            $table->string('slug', 160)->unique();
            $table->text('description')->nullable();
            $table->string('status', 20)->default('draft');
            $table->string('visibility', 20)->default('public');
            $table->unsignedInteger('sort_order')->default(0);
            $table->unsignedTinyInteger('depth')->default(0);
            $table->string('path', 700);
            $table->string('image_path', 2048)->nullable();
            $table->string('icon_path', 2048)->nullable();
            $table->string('desktop_banner_path', 2048)->nullable();
            $table->string('mobile_banner_path', 2048)->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('show_in_navigation')->default(false);
            $table->boolean('show_on_homepage')->default(false);
            $table->string('default_sort', 20)->default('featured');
            $table->string('meta_title', 160)->nullable();
            $table->string('meta_description', 320)->nullable();
            $table->string('canonical_url', 2048)->nullable();
            $table->boolean('robots_index')->default(true);
            $table->boolean('robots_follow')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['parent_id', 'status', 'sort_order']);
            $table->index(['status', 'show_in_navigation', 'sort_order']);
            $table->index(['status', 'show_on_homepage', 'sort_order']);
            $table->index(['status', 'visibility', 'sort_order']);
            $table->index('is_featured');
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
