<?php

namespace App\Http\Resources\Admin;

use App\Models\UserPaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin UserPaymentMethod */
class AdminUserPaymentMethodResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'user_id' => (string) $this->resource->user_id,
            'brand' => $this->resource->brand,
            'last4' => $this->resource->last4,
            'expiry_month' => (int) $this->resource->expiry_month,
            'expiry_year' => (int) $this->resource->expiry_year,
            'is_default' => (bool) $this->resource->is_default,
            'status' => $this->resource->status,
            'created_at' => $this->resource->created_at?->toIso8601String(),
        ];
    }
}
