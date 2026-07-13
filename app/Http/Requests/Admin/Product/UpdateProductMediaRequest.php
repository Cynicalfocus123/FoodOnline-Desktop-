<?php
namespace App\Http\Requests\Admin\Product;
class UpdateProductMediaRequest extends MediaRequest { public function rules(): array { return $this->mediaRules(true); } }
