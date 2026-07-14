<?php

namespace App\Http\Requests\Admin\Media;

use App\Models\ProductMedia;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CompleteMediaUploadRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->role === 'admin' && $this->user()?->status === 'active'; }
    public function rules(): array
    {
        return [
            'alt_text' => ['sometimes', 'nullable', 'string', 'max:500'],
            'image_fit' => ['sometimes', Rule::in(ProductMedia::IMAGE_FITS)],
            'is_primary' => ['sometimes', 'boolean'],
        ];
    }
}
