<?php

namespace App\Http\Requests\Admin\Media;

use App\Models\MediaUpload;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateMediaUploadRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->role === 'admin' && $this->user()?->status === 'active'; }
    protected function prepareForValidation(): void
    {
        $this->merge([
            'mime_type' => strtolower(trim((string) $this->input('mime_type'))),
            'original_filename' => trim((string) $this->input('original_filename')),
        ]);
    }
    public function rules(): array
    {
        return [
            'purpose' => ['required', Rule::in(MediaUpload::PURPOSES)], 'target_uuid' => ['required', 'uuid'],
            'product_media_id' => ['nullable', 'integer', 'min:1'], 'original_filename' => ['required', 'string', 'max:255'],
            'mime_type' => ['required', 'string', Rule::in(config('foodonlines.media.allowed_mime_types', []))],
            'size_bytes' => ['required', 'integer', 'min:1', 'max:10485760'],
        ];
    }
}
