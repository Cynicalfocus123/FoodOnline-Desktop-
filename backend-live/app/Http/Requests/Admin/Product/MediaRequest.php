<?php

namespace App\Http\Requests\Admin\Product;

use App\Models\ProductMedia;
use App\Rules\SafeMediaPath;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

abstract class MediaRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->role === 'admin'; }
    protected function prepareForValidation(): void
    {
        $changes=[];
        foreach(['path','alt_text','image_fit'] as $field){ if($this->exists($field)&&is_string($this->input($field))){$changes[$field]=trim((string)$this->input($field));} }
        $this->merge($changes);
    }
    protected function mediaRules(bool $partial): array
    {
        $media=$this->route('media');
        $id=$media instanceof ProductMedia?$media->id:null;
        $product=$this->route('product');
        $productId=$product?->id ?? ($media instanceof ProductMedia?$media->product_id:null);
        $presence=$partial?'sometimes':'required';
        return [
            'path'=>[$presence,'string','max:2048',new SafeMediaPath,Rule::unique('product_media','path')->where(fn($q)=>$q->where('product_id',$productId))->ignore($id)],
            'alt_text'=>['sometimes','nullable','string','max:255'],
            'image_fit'=>['sometimes',Rule::in(ProductMedia::IMAGE_FITS)],
            'is_primary'=>['sometimes','boolean'],
            'sort_order'=>['sometimes','integer','min:0','max:1000000'],
        ];
    }
}
