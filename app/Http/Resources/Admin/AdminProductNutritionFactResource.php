<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminProductNutritionFactResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'serving_size' => $this->serving_size, 'calories' => $this->calories, 'total_fat_g' => $this->total_fat_g,
            'sodium_mg' => $this->sodium_mg, 'total_carbohydrate_g' => $this->total_carbohydrate_g,
            'total_sugars_g' => $this->total_sugars_g, 'protein_g' => $this->protein_g,
            'ingredients_note' => $this->ingredients_note, 'allergen_note' => $this->allergen_note,
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
