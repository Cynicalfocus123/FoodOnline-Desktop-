<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Services\Security\AdminPermissionCatalog;

class AdminUserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $permissions = AdminPermissionCatalog::effectivePermissions($this->resource);

        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'email' => $this->resource->email,
            'role' => $this->resource->role,
            'staff_role' => $this->resource->staff_role ?? AdminPermissionCatalog::SUPER_ADMIN,
            'permissions' => $permissions,
            'status' => $this->resource->status,
            'mfa_enabled' => $this->resource->mfa_enabled_at !== null,
            'last_login_at' => $this->resource->last_login_at?->toIso8601String(),
        ];
    }
}
