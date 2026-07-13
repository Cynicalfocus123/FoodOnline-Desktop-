<?php

namespace App\Http\Requests\Admin\Product;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

abstract class ProductRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->role === 'admin'; }
    protected function prepareForValidation(): void
    {
        $changes = [];
        foreach (['name','slug','description','ingredients_text','allergen_statement','storage_instructions'] as $field) { if ($this->exists($field) && is_string($this->input($field))) { $changes[$field] = trim(strip_tags((string) $this->input($field))); } }
        if ($this->exists('slug')) { $changes['slug'] = Str::slug((string) $this->input('slug')); }
        if ($this->exists('country_of_origin_code') && is_string($this->input('country_of_origin_code'))) { $changes['country_of_origin_code'] = strtoupper(trim((string) $this->input('country_of_origin_code'))); }
        $this->merge($changes);
    }
    protected function productRules(bool $partial): array
    {
        $product = $this->route('product');
        $id = $product instanceof Product ? $product->id : null;
        $presence = $partial ? 'sometimes' : 'required';
        return [
            'category_id'=>[$presence,'integer',Rule::exists('categories','id')->whereNull('deleted_at')],
            'brand_id'=>['sometimes','nullable','integer',Rule::exists('brands','id')],
            'name'=>[$presence,'string','max:255'],
            'slug'=>[$presence,'string','max:160','regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',Rule::unique('products','slug')->ignore($id)],
            'description'=>['sometimes','nullable','string','max:50000'],
            'country_of_origin_code'=>['sometimes','nullable','regex:/^[A-Z]{2}$/'],
            'storage_type'=>['sometimes','nullable',Rule::in(Product::STORAGE_TYPES)],
            'ingredients_text'=>['sometimes','nullable','string','max:50000'],
            'allergen_statement'=>['sometimes','nullable','string','max:10000'],
            'storage_instructions'=>['sometimes','nullable','string','max:10000'],
            'is_featured'=>['sometimes','boolean'],
        ];
    }
    public function after(): array
    {
        return [function (Validator $validator): void {
            $product = $this->route('product');
            if ($product instanceof Product && $product->status === 'published' && $this->exists('slug') && $this->input('slug') !== $product->slug) { $validator->errors()->add('slug', 'Archive the product before changing its published slug.'); }
            if ($this->exists('brand_id') && $this->input('brand_id') !== null) {
                $sameExisting = $product instanceof Product && (int) $this->input('brand_id') === (int) $product->brand_id;
                if (! $sameExisting && ! \App\Models\Brand::query()->active()->whereKey($this->input('brand_id'))->exists()) { $validator->errors()->add('brand_id', 'The selected brand must be active.'); }
            }
        }];
    }
}
