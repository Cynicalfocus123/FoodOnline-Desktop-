<?php

namespace App\Http\Requests\Admin\Product;

use Illuminate\Foundation\Http\FormRequest;

class ProductNutritionFactRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->role === 'admin'; }
    public function rules(): array
    {
        return [
            'serving_size' => ['nullable', 'string', 'max:150'], 'calories' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'total_fat_g' => ['nullable', 'numeric', 'min:0', 'max:1000000'], 'sodium_mg' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'total_carbohydrate_g' => ['nullable', 'numeric', 'min:0', 'max:1000000'], 'total_sugars_g' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'protein_g' => ['nullable', 'numeric', 'min:0', 'max:1000000'], 'ingredients_note' => ['nullable', 'string', 'max:10000'],
            'allergen_note' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
