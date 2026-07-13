<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Catalog\BrandResource;
use Illuminate\Http\Request;

class AdminBrandResource extends BrandResource
{
    public function toArray(Request $request): array
    {
        return [...parent::toArray($request),'logo_path'=>$this->logo_path,'is_active'=>$this->is_active,'sort_order'=>$this->sort_order,'created_by'=>$this->created_by,'updated_by'=>$this->updated_by,'created_at'=>$this->created_at?->toIso8601String(),'updated_at'=>$this->updated_at?->toIso8601String()];
    }
}
