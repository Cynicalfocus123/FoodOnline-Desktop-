<?php
namespace App\Http\Requests\Admin\Brand;
class StoreBrandRequest extends BrandRequest { public function rules(): array { return $this->brandRules(false); } }
