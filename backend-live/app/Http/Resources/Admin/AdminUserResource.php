<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'email' => $this->resource->email,
            'role' => $this->resource->role,
            'staff_role' => $this->resource->staff_role,
            'permissions' => $this->resource->staff_permissions ?? [],
            'mfa_enabled' => $this->resource->mfa_enabled_at !== null,
            'last_login_at' => $this->resource->last_login_at?->toIso8601String(),
        ];
    }
}
