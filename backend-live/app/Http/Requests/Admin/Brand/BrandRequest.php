<?php

namespace App\Http\Requests\Admin\Brand;

use App\Models\Brand;
use App\Rules\SafeMediaPath;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

abstract class BrandRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->role === 'admin'; }

    protected function prepareForValidation(): void
    {
        $changes = [];
        foreach (['name', 'slug', 'logo_path'] as $field) { if ($this->exists($field) && is_string($this->input($field))) { $changes[$field] = trim((string) $this->input($field)); } }
        if ($this->exists('slug')) { $changes['slug'] = Str::slug((string) $this->input('slug')); }
        if ($this->exists('country_code') && is_string($this->input('country_code'))) { $changes['country_code'] = strtoupper(trim((string) $this->input('country_code'))); }
        $this->merge($changes);
    }

    protected function brandRules(bool $partial): array
    {
        $brand = $this->route('brand');
        $id = $brand instanceof Brand ? $brand->id : null;
        $presence = $partial ? 'sometimes' : 'required';
        return [
            'name' => [$presence, 'string', 'max:150'],
            'slug' => [$presence, 'string', 'max:160', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('brands', 'slug')->ignore($id)],
            'logo_path' => ['sometimes', 'nullable', 'string', 'max:2048', new SafeMediaPath],
            'country_code' => ['sometimes', 'nullable', 'regex:/^[A-Z]{2}$/'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
        ];
    }
}
