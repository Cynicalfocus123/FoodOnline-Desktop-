<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Account\UserAddressResource;
use Illuminate\Http\Request;

class AdminUserAddressResource extends UserAddressResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'user_id' => (string) $this->resource->user_id,
            ...parent::toArray($request),
        ];
    }
}
