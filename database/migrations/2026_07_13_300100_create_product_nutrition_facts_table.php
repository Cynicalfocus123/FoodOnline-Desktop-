<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_nutrition_facts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('serving_size', 150)->nullable();
            $table->unsignedInteger('calories')->nullable();
            $table->decimal('total_fat_g', 10, 3)->nullable();
            $table->decimal('sodium_mg', 10, 3)->nullable();
            $table->decimal('total_carbohydrate_g', 10, 3)->nullable();
            $table->decimal('total_sugars_g', 10, 3)->nullable();
            $table->decimal('protein_g', 10, 3)->nullable();
            $table->text('ingredients_note')->nullable();
            $table->text('allergen_note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('product_nutrition_facts'); }
};
