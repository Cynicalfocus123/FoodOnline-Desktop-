<?php

namespace App\Http\Resources\Catalog;

use App\Services\Catalog\CategoryMediaUrl;
use Illuminate\Http\Request;

class ProductDetailResource extends ProductListResource
{
    public function toArray(Request $request): array
    {
        $data=parent::toArray($request);
        $media=app(CategoryMediaUrl::class);
        $images=$this->media->map(fn($item)=>['id'=>(string)$item->id,'url'=>$media->make($item->path),'alt'=>$item->alt_text?:$this->name,'image_fit'=>$item->image_fit,'is_primary'=>$item->is_primary])->values();
        return [...$data,
            'category'=>['id'=>(string)$this->category_id,'uuid'=>$this->category?->uuid,'name'=>$this->category?->name,'slug'=>$this->category?->slug],
            'brand_summary'=>$this->brand?new BrandResource($this->brand):null,'description'=>$this->description,
            'country_of_origin_code'=>$this->country_of_origin_code,'storage_type'=>$this->storage_type,
            'ingredients'=>$this->ingredients_text,'allergen_statement'=>$this->allergen_statement,'storage_instructions'=>$this->storage_instructions,
            'image_urls'=>$images->pluck('url')->filter()->values(),'images'=>$images,
            'default_variant'=>$this->defaultVariant?new ProductVariantResource($this->defaultVariant):null,
            'variants'=>ProductVariantResource::collection($this->whenLoaded('activeVariants')),
            'nutrition_facts'=>$this->nutritionFacts ? new ProductNutritionFactResource($this->nutritionFacts) : null,
            'published_at'=>$this->published_at?->toIso8601String(),
        ];
    }
}
