<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductNutritionFact extends Model
{
    protected $fillable = [
        'serving_size', 'calories', 'total_fat_g', 'sodium_mg', 'total_carbohydrate_g', 'total_sugars_g',
        'protein_g', 'ingredients_note', 'allergen_note',
    ];

    protected function casts(): array
    {
        return [
            'calories' => 'integer', 'total_fat_g' => 'decimal:3', 'sodium_mg' => 'decimal:3',
            'total_carbohydrate_g' => 'decimal:3', 'total_sugars_g' => 'decimal:3', 'protein_g' => 'decimal:3',
        ];
    }

    public function product(): BelongsTo { return $this->belongsTo(Product::class); }
}
