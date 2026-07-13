<?php

namespace App\Http\Requests\Admin\Product;

use App\Models\ProductVariant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

abstract class VariantRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->role === 'admin'; }
    protected function prepareForValidation(): void
    {
        $changes = [];
        foreach (['title','sku','gtin','size_label','net_content_unit','package_type','currency_code','availability_status'] as $field) {
            if ($this->exists($field) && is_string($this->input($field))) { $changes[$field] = trim((string) $this->input($field)); }
        }
        if ($this->exists('sku')) { $changes['sku'] = strtoupper((string) ($changes['sku'] ?? $this->input('sku'))); }
        if ($this->exists('currency_code')) { $changes['currency_code'] = strtoupper((string) ($changes['currency_code'] ?? $this->input('currency_code'))); }
        $this->merge($changes);
    }
    protected function variantRules(bool $partial): array
    {
        $variant = $this->route('variant');
        $id = $variant instanceof ProductVariant ? $variant->id : null;
        $presence = $partial ? 'sometimes' : 'required';
        return [
            'title'=>[$presence,'string','max:150'],
            'sku'=>[$presence,'string','max:100','regex:/^[A-Z0-9][A-Z0-9._-]*$/',Rule::unique('product_variants','sku')->ignore($id)],
            'gtin'=>['sometimes','nullable','regex:/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/',Rule::unique('product_variants','gtin')->ignore($id)],
            'size_label'=>['sometimes','nullable','string','max:100'],
            'net_content_value'=>['sometimes','nullable','numeric','gt:0','required_with:net_content_unit'],
            'net_content_unit'=>['sometimes','nullable',Rule::in(ProductVariant::NET_CONTENT_UNITS),'required_with:net_content_value'],
            'pack_count'=>['sometimes','integer','min:1','max:100000'],
            'package_type'=>['sometimes','nullable',Rule::in(ProductVariant::PACKAGE_TYPES)],
            'price_amount'=>[$presence,'numeric','gt:0','decimal:0,2'],
            'compare_at_price_amount'=>['sometimes','nullable','numeric','gt:0','decimal:0,2'],
            'currency_code'=>[$presence,'string',Rule::in([config('foodonlines.catalog_currency')])],
            'availability_status'=>['sometimes',Rule::in(ProductVariant::AVAILABILITY_STATUSES)],
            'is_default'=>['sometimes','boolean'],
            'is_active'=>['sometimes','boolean'],
            'sort_order'=>['sometimes','integer','min:0','max:1000000'],
        ];
    }
    public function after(): array
    {
        return [function (Validator $validator): void {
            $variant = $this->route('variant');
            $price = $this->exists('price_amount') ? (float) $this->input('price_amount') : ($variant instanceof ProductVariant ? (float) $variant->price_amount : null);
            $compare = $this->exists('compare_at_price_amount') ? $this->input('compare_at_price_amount') : ($variant instanceof ProductVariant ? $variant->compare_at_price_amount : null);
            $active = $this->exists('is_active') ? $this->boolean('is_active') : ($variant instanceof ProductVariant ? $variant->is_active : true);
            $default = $this->exists('is_default') ? $this->boolean('is_default') : ($variant instanceof ProductVariant ? $variant->is_default : false);
            if ($compare !== null && $price !== null && (float) $compare <= $price) { $validator->errors()->add('compare_at_price_amount', 'The compare-at price must be greater than the current price.'); }
            if ($default && ! $active) { $validator->errors()->add('is_default', 'An inactive variant cannot be default.'); }
            $value = $this->exists('net_content_value') ? $this->input('net_content_value') : ($variant instanceof ProductVariant ? $variant->net_content_value : null);
            $unit = $this->exists('net_content_unit') ? $this->input('net_content_unit') : ($variant instanceof ProductVariant ? $variant->net_content_unit : null);
            if (($value === null) !== ($unit === null)) { $validator->errors()->add($value === null ? 'net_content_value' : 'net_content_unit', 'Net content value and unit must be supplied together.'); }
        }];
    }
}
