<?php

namespace App\Http\Resources\Admin;

use App\Services\Catalog\CategoryMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminProductMediaResource extends JsonResource
{
    public function toArray(Request $request): array { return ['id'=>(string)$this->id,'product_id'=>(string)$this->product_id,'path'=>$this->path,'url'=>app(CategoryMediaUrl::class)->make($this->path),'alt_text'=>$this->alt_text,'image_fit'=>$this->image_fit,'is_primary'=>$this->is_primary,'sort_order'=>$this->sort_order,'created_at'=>$this->created_at?->toIso8601String(),'updated_at'=>$this->updated_at?->toIso8601String()]; }
}
