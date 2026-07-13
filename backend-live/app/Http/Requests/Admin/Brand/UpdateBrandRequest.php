<?php
namespace App\Http\Requests\Admin\Brand;
class UpdateBrandRequest extends BrandRequest { public function rules(): array { return $this->brandRules(true); } }
