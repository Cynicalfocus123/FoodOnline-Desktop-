<?php

namespace App\Http\Resources\Account;

use App\Models\UserAddress;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin UserAddress */
class UserAddressResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'country_key' => $this->resource->country_key,
            'address_values' => is_array($this->resource->address_values) ? $this->resource->address_values : [],
            'summary' => $this->resource->summary,
            'is_default' => (bool) $this->resource->is_default,
            'created_at' => $this->resource->created_at?->toISOString(),
            'updated_at' => $this->resource->updated_at?->toISOString(),
        ];
    }
}
