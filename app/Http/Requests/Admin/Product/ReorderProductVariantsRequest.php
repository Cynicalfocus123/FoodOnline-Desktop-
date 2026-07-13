<?php
namespace App\Http\Requests\Admin\Product;
use Illuminate\Foundation\Http\FormRequest;
class ReorderProductVariantsRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->role === 'admin'; }
    public function rules(): array { return ['variant_ids'=>['required','array','min:1'],'variant_ids.*'=>['required','uuid','distinct','exists:product_variants,uuid']]; }
}
