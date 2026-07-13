<?php
namespace App\Http\Requests\Admin\Product;
class StoreProductVariantRequest extends VariantRequest { public function rules(): array { return $this->variantRules(false); } }
