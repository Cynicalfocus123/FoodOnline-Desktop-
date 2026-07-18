<?php

namespace App\Http\Requests\Admin\Category;

use App\Models\Category;
use App\Rules\SafeMediaPath;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

abstract class CategoryRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->role === 'admin'; }

    protected function prepareForValidation(): void
    {
        $changes = [];
        foreach (['name', 'slug', 'description', 'meta_title', 'meta_description', 'canonical_url'] as $field) {
            if ($this->exists($field)) {
                $value = $this->input($field);
                $value = is_string($value) ? trim(strip_tags($value)) : $value;
                $changes[$field] = $value === '' && $field !== 'name' && $field !== 'slug' ? null : $value;
            }
        }
        if ($this->exists('slug') || $this->exists('name')) {
            $slugSource = trim((string) $this->input('slug')) ?: (string) $this->input('name');
            $changes['slug'] = Str::slug($slugSource);
        }
        foreach (['image_path', 'icon_path', 'desktop_banner_path', 'mobile_banner_path'] as $field) {
            if ($this->exists($field)) {
                $value = is_string($this->input($field)) ? trim((string) $this->input($field)) : $this->input($field);
                $changes[$field] = $value === '' ? null : $value;
            }
        }
        $this->merge($changes);
    }

    /** @return array<string, mixed> */
    protected function categoryRules(bool $partial): array
    {
        $category = $this->route('category');
        $categoryId = $category instanceof Category ? $category->id : null;
        $presence = $partial ? 'sometimes' : 'required';
        $nullableStrings = ['nullable', 'string'];

        return [
            'name' => [$presence, 'string', 'max:160'],
            'slug' => [$presence, 'string', 'max:160', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('categories', 'slug')->ignore($categoryId), Rule::unique('category_aliases', 'alias_slug')],
            'parent_id' => ['sometimes', 'nullable', 'integer', Rule::exists('categories', 'id')->whereNull('deleted_at')],
            'description' => [...($partial ? ['sometimes'] : []), ...$nullableStrings, 'max:10000'],
            'status' => ['sometimes', Rule::in(Category::STATUSES)],
            'visibility' => ['sometimes', Rule::in(Category::VISIBILITIES)],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
            'image_path' => ['sometimes', 'nullable', 'string', 'max:2048', new SafeMediaPath],
            'icon_path' => ['sometimes', 'nullable', 'string', 'max:2048', new SafeMediaPath],
            'desktop_banner_path' => ['sometimes', 'nullable', 'string', 'max:2048', new SafeMediaPath],
            'mobile_banner_path' => ['sometimes', 'nullable', 'string', 'max:2048', new SafeMediaPath],
            'is_featured' => ['sometimes', 'boolean'],
            'show_in_navigation' => ['sometimes', 'boolean'],
            'show_on_homepage' => ['sometimes', 'boolean'],
            'default_sort' => ['sometimes', Rule::in(Category::DEFAULT_SORTS)],
            'meta_title' => ['sometimes', 'nullable', 'string', 'max:160'],
            'meta_description' => ['sometimes', 'nullable', 'string', 'max:320'],
            'canonical_url' => ['sometimes', 'nullable', 'url:https', 'max:2048'],
            'robots_index' => ['sometimes', 'boolean'],
            'robots_follow' => ['sometimes', 'boolean'],
        ];
    }
}
