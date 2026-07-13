<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Catalog\CategoryResource;
use App\Services\Catalog\CategoryMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $public = (new CategoryResource($this->resource))->toArray($request);
        $media = app(CategoryMediaUrl::class);

        return [
            ...$public,
            'parent_id' => $this->parent_id === null ? null : (string) $this->parent_id,
            'parent' => $this->whenLoaded('parent', fn () => $this->parent ? ['id' => (string) $this->parent->id, 'name' => $this->parent->name, 'slug' => $this->parent->slug] : null),
            'status' => $this->status,
            'visibility' => $this->visibility,
            'sort_order' => $this->sort_order,
            'depth' => $this->depth,
            'path' => $this->path,
            'media' => [
                'image_path' => $this->image_path, 'image_url' => $media->make($this->image_path),
                'icon_path' => $this->icon_path, 'icon_url' => $media->make($this->icon_path),
                'desktop_banner_path' => $this->desktop_banner_path, 'desktop_banner_url' => $media->make($this->desktop_banner_path),
                'mobile_banner_path' => $this->mobile_banner_path, 'mobile_banner_url' => $media->make($this->mobile_banner_path),
            ],
            'seo' => [
                'meta_title' => $this->meta_title,
                'meta_description' => $this->meta_description,
                'canonical_url' => $this->canonical_url,
                'robots_index' => $this->robots_index,
                'robots_follow' => $this->robots_follow,
            ],
            'aliases' => CategoryAliasResource::collection($this->whenLoaded('aliases')),
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
