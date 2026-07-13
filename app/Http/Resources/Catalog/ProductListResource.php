<?php

namespace App\Http\Resources\Catalog;

use App\Services\Catalog\CategoryMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $variant=$this->defaultVariant;
        $primary=$this->primaryMedia;
        $media=app(CategoryMediaUrl::class);
        $imageUrl=$media->make($primary?->path);
        return [
            'id'=>(string)$this->id,'uuid'=>$this->uuid,'name'=>$this->name,'slug'=>$this->slug,
            'category_id'=>(string)$this->category_id,'category_slug'=>$this->category?->slug,'category_name'=>$this->category?->name,
            'brand'=>$this->brand?->name,'brand_id'=>$this->brand?->uuid,'price'=>$variant?->price_amount,
            'old_price'=>$variant?->compare_at_price_amount,'currency_code'=>$variant?->currency_code,'primary_image'=>$imageUrl,
            'image_urls'=>$imageUrl?[$imageUrl]:[],'image_fit'=>$primary?->image_fit ?? 'contain',
            'in_stock'=>$variant?->availability_status==='in_stock','availability_status'=>$variant?->availability_status,
            'size'=>$variant?->displaySize(),'sku'=>$variant?->sku,'is_featured'=>$this->is_featured,
        ];
    }
}
