<?php
namespace App\Http\Requests\Admin\Product;
class UpdateProductVariantRequest extends VariantRequest { public function rules(): array { return $this->variantRules(true); } }
