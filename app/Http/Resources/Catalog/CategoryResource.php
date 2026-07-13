<?php

namespace App\Http\Resources\Catalog;

use App\Services\Catalog\CategoryMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $media = app(CategoryMediaUrl::class);

        return [
            'id' => (string) $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'image_url' => $media->make($this->image_path),
            'icon_url' => $media->make($this->icon_path),
            'desktop_banner_url' => $media->make($this->desktop_banner_path),
            'mobile_banner_url' => $media->make($this->mobile_banner_path),
            'is_featured' => $this->is_featured,
            'show_in_navigation' => $this->show_in_navigation,
            'show_on_homepage' => $this->show_on_homepage,
            'default_sort' => $this->default_sort,
            'children' => CategoryResource::collection($this->whenLoaded('activeChildren')),
        ];
    }
}
