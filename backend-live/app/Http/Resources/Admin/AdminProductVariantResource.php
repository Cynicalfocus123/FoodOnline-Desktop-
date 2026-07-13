<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Catalog\ProductVariantResource;
use Illuminate\Http\Request;

class AdminProductVariantResource extends ProductVariantResource
{
    public function toArray(Request $request): array { return [...parent::toArray($request),'product_id'=>(string)$this->product_id,'size_label'=>$this->size_label,'is_active'=>$this->is_active,'sort_order'=>$this->sort_order,'created_at'=>$this->created_at?->toIso8601String(),'updated_at'=>$this->updated_at?->toIso8601String()]; }
}
