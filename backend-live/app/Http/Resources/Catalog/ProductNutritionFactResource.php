<?php

namespace App\Http\Resources\Catalog;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductNutritionFactResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'serving_size' => $this->serving_size, 'calories' => $this->calories,
            'total_fat' => $this->measure($this->total_fat_g, 'g'), 'sodium' => $this->measure($this->sodium_mg, 'mg'),
            'carbohydrates' => $this->measure($this->total_carbohydrate_g, 'g'), 'sugar' => $this->measure($this->total_sugars_g, 'g'),
            'protein' => $this->measure($this->protein_g, 'g'), 'ingredients_note' => $this->ingredients_note, 'allergen_note' => $this->allergen_note,
        ];
    }

    private function measure(mixed $value, string $unit): ?string
    {
        if ($value === null) { return null; }
        return rtrim(rtrim(number_format((float) $value, 3, '.', ''), '0'), '.').' '.$unit;
    }
}
