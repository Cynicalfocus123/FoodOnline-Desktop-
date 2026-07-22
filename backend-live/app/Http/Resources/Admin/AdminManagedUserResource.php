<?php

namespace App\Http\Resources\Admin;

use App\Models\UserAddress;
use App\Models\UserPaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminManagedUserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->resource->id,
            'account_type' => $this->resource->account_type ?: $this->resource->role,
            'role' => $this->resource->account_type ?: $this->resource->role,
            'email' => $this->resource->email,
            'name' => $this->resource->name,
            'first_name' => $this->resource->first_name,
            'last_name' => $this->resource->last_name,
            'phone' => $this->resource->phone ?: $this->resource->contact_number,
            'contact_number' => $this->resource->contact_number ?: $this->resource->phone,
            'line_id' => $this->resource->line_id,
            'company_name' => $this->resource->company_name,
            'business_type' => $this->resource->business_type,
            'status' => $this->resource->status,
            'registered_from' => $this->resource->registered_from,
            'created_at' => $this->resource->created_at?->toIso8601String(),
            'updated_at' => $this->resource->updated_at?->toIso8601String(),
            'addresses' => $this->when($this->resource->relationLoaded('addresses'), fn () => $this->resource->addresses
                ->map(fn (UserAddress $address): array => (new AdminUserAddressResource($address))->resolve())
                ->values()),
            'payment_methods' => $this->when($this->resource->relationLoaded('paymentMethods'), fn () => $this->resource->paymentMethods
                ->map(fn (UserPaymentMethod $method): array => (new AdminUserPaymentMethodResource($method))->resolve())
                ->values()),
            'referral_summary' => $this->when($this->resource->relationLoaded('referralCode'), fn () => [
                'code' => $this->resource->referralCode?->code,
                'code_status' => $this->resource->referralCode?->status,
                'referrals_made' => $this->resource->relationLoaded('referralsMade') ? $this->resource->referralsMade->count() : null,
                'was_referred' => $this->resource->relationLoaded('referralReceived') && (bool) $this->resource->referralReceived,
                'coupon_count' => $this->resource->relationLoaded('referralRewards') ? $this->resource->referralRewards->count() : null,
            ]),
        ];
    }
}
