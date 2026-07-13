<?php

namespace App\Http\Requests\Admin\Category;

use Illuminate\Foundation\Http\FormRequest;

class ReorderCategoriesRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->role === 'admin'; }
    public function rules(): array
    {
        return [
            'parent_id' => ['present', 'nullable', 'integer', 'exists:categories,id'],
            'category_ids' => ['required', 'array', 'min:1'],
            'category_ids.*' => ['required', 'integer', 'distinct', 'exists:categories,id'],
        ];
    }
}
