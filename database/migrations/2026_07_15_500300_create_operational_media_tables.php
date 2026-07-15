<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('return_media', function (Blueprint $table): void {
            $table->id(); $table->uuid('uuid')->unique(); $table->foreignId('return_request_id')->constrained()->cascadeOnDelete(); $table->foreignId('media_upload_id')->nullable()->constrained()->nullOnDelete(); $table->string('path', 700); $table->string('alt_text', 180)->nullable(); $table->unsignedInteger('sort_order')->default(0); $table->timestamps(); $table->index(['return_request_id', 'sort_order']);
        });
        Schema::create('support_media', function (Blueprint $table): void {
            $table->id(); $table->uuid('uuid')->unique(); $table->foreignId('support_ticket_id')->constrained()->cascadeOnDelete(); $table->foreignId('support_message_id')->nullable()->constrained()->nullOnDelete(); $table->foreignId('media_upload_id')->nullable()->constrained()->nullOnDelete(); $table->string('path', 700); $table->string('alt_text', 180)->nullable(); $table->unsignedInteger('sort_order')->default(0); $table->timestamps(); $table->index(['support_ticket_id', 'sort_order']);
        });
    }
    public function down(): void { Schema::dropIfExists('support_media'); Schema::dropIfExists('return_media'); }
};
