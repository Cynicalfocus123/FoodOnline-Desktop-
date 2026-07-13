<?php
namespace App\Http\Requests\Admin\Product;
use Illuminate\Foundation\Http\FormRequest;
class ReorderProductMediaRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->role === 'admin'; }
    public function rules(): array { return ['media_ids'=>['required','array','min:1'],'media_ids.*'=>['required','integer','distinct','exists:product_media,id']]; }
}
