<?php

namespace App\Http\Requests\Admin\Category;

use Illuminate\Foundation\Http\FormRequest;

class DeleteCategoryRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->role === 'admin'; }
    public function rules(): array { return ['confirm_slug' => ['required', 'string', 'max:160']]; }
}
