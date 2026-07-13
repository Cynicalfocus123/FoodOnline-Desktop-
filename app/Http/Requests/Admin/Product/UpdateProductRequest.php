<?php
namespace App\Http\Requests\Admin\Product;
class UpdateProductRequest extends ProductRequest { public function rules(): array { return $this->productRules(true); } }
