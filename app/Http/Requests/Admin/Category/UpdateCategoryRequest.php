<?php

namespace App\Http\Requests\Admin\Category;

class UpdateCategoryRequest extends CategoryRequest
{
    public function rules(): array { return $this->categoryRules(true); }
}
