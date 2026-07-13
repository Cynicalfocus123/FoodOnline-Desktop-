<?php
namespace App\Http\Requests\Admin\Product;
class StoreProductRequest extends ProductRequest { public function rules(): array { return $this->productRules(false); } }
