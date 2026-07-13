<?php

namespace App\Http\Resources\Catalog;

use App\Services\Catalog\CategoryMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BrandResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id'=>(string)$this->id,'uuid'=>$this->uuid,'name'=>$this->name,'slug'=>$this->slug,'logo_url'=>app(CategoryMediaUrl::class)->make($this->logo_path),'country_code'=>$this->country_code];
    }
}
