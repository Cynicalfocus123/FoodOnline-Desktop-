<?php

namespace App\Http\Requests\Admin\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreCategoryAliasRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->role === 'admin'; }
    protected function prepareForValidation(): void { $this->merge(['alias_slug' => Str::slug((string) $this->input('alias_slug'))]); }
    public function rules(): array
    {
        return [
            'alias_slug' => ['required', 'string', 'max:160', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('category_aliases', 'alias_slug'), Rule::unique('categories', 'slug')],
            'redirect_code' => ['required', Rule::in([301, 302])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
