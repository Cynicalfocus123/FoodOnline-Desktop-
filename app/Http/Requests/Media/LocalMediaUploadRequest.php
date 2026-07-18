<?php

namespace App\Http\Requests\Media;

use App\Models\MediaUpload;
use App\Models\ProductMedia;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LocalMediaUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'purpose' => ['required', Rule::in(MediaUpload::PURPOSES)],
            'target_uuid' => ['required', 'uuid'],
            'product_media_id' => ['nullable', 'integer', 'min:1'],
            'file' => ['required', 'file', 'max:10240'],
            'alt_text' => ['sometimes', 'nullable', 'string', 'max:500'],
            'image_fit' => ['sometimes', Rule::in(ProductMedia::IMAGE_FITS)],
            'is_primary' => ['sometimes', 'boolean'],
        ];
    }
}
