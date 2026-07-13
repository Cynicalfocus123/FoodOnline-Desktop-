<?php
namespace App\Http\Requests\Admin\Product;
class StoreProductMediaRequest extends MediaRequest { public function rules(): array { return $this->mediaRules(false); } }
