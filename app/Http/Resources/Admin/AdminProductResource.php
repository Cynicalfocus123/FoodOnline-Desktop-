<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Catalog\ProductDetailResource;
use App\Services\Catalog\ProductPublicationService;
use Illuminate\Http\Request;

class AdminProductResource extends ProductDetailResource
{
    public function toArray(Request $request): array
    {
        $public=parent::toArray($request);
        return [...$public,'internal_id'=>$this->id,'category_id'=>(string)$this->category_id,'brand_internal_id'=>$this->brand_id,'status'=>$this->status,'is_featured'=>$this->is_featured,'variants'=>AdminProductVariantResource::collection($this->whenLoaded('variants')),'media'=>AdminProductMediaResource::collection($this->whenLoaded('media')),'readiness_errors'=>app(ProductPublicationService::class)->readinessErrors($this->resource),'created_by'=>$this->created_by,'updated_by'=>$this->updated_by,'created_at'=>$this->created_at?->toIso8601String(),'updated_at'=>$this->updated_at?->toIso8601String()];
    }
}
