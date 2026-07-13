<?php

namespace App\Http\Requests\Admin\Category;

class StoreCategoryRequest extends CategoryRequest
{
    public function rules(): array { return $this->categoryRules(false); }
}
