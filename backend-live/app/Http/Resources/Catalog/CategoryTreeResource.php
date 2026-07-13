<?php

namespace App\Http\Resources\Catalog;

use Illuminate\Http\Request;

class CategoryTreeResource extends CategoryResource
{
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);
        $data['children'] = $this->resource->relationLoaded('treeChildren')
            ? CategoryTreeResource::collection($this->resource->getRelation('treeChildren'))
            : [];

        return $data;
    }
}
