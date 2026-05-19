<?php

namespace App\Http\Resources\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RegisteredUserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'email' => $this->resource->email,
            'first_name' => $this->resource->first_name,
            'last_name' => $this->resource->last_name,
            'company_name' => $this->resource->company_name,
            'contact_number' => $this->resource->contact_number ?: $this->resource->phone,
            'line_id' => $this->resource->line_id,
            'account_type' => $this->resource->account_type ?: $this->resource->role,
            'role' => $this->resource->account_type ?: $this->resource->role,
            'status' => $this->resource->status,
            'registered_from' => $this->resource->registered_from,
            'registered_at' => $this->resource->created_at?->toIso8601String(),
        ];
    }
}
