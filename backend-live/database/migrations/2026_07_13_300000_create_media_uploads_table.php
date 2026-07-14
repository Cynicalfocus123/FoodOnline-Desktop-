<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_uploads', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('purpose', 40);
            $table->string('target_type', 20);
            $table->unsignedBigInteger('target_id');
            $table->string('target_field', 40)->nullable();
            $table->foreignId('product_media_id')->nullable()->constrained('product_media')->nullOnDelete();
            $table->string('disk', 40);
            $table->string('object_key', 700)->unique();
            $table->string('original_filename', 255);
            $table->string('expected_mime_type', 80);
            $table->unsignedBigInteger('expected_size_bytes');
            $table->string('actual_mime_type', 80)->nullable();
            $table->unsignedBigInteger('actual_size_bytes')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->string('status', 30)->default('pending');
            $table->timestamp('expires_at');
            $table->timestamp('finalized_at')->nullable();
            $table->timestamp('cleanup_attempted_at')->nullable();
            $table->string('cleanup_error', 500)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['status', 'expires_at']);
            $table->index(['target_type', 'target_id']);
            $table->index('created_by');
            $table->index('product_media_id');
        });
    }

    public function down(): void { Schema::dropIfExists('media_uploads'); }
};
