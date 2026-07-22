<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Promotion extends Model
{
    use HasPublicUuid;

    protected $fillable = ['uuid', 'code', 'name', 'description', 'discount_type', 'discount_value', 'minimum_subtotal_minor', 'maximum_discount_minor', 'currency_code', 'starts_at', 'ends_at', 'total_usage_limit', 'per_user_usage_limit', 'usage_count', 'active', 'applies_to', 'created_by', 'updated_by', 'archived_at'];
    protected function casts(): array { return ['starts_at' => 'datetime', 'ends_at' => 'datetime', 'archived_at' => 'datetime', 'active' => 'boolean', 'discount_value' => 'integer', 'minimum_subtotal_minor' => 'integer', 'maximum_discount_minor' => 'integer', 'total_usage_limit' => 'integer', 'per_user_usage_limit' => 'integer', 'usage_count' => 'integer']; }
    protected static function booted(): void { static::saving(fn (Promotion $promotion) => $promotion->code = Str::upper(trim($promotion->code))); }
    public function products(): BelongsToMany { return $this->belongsToMany(Product::class, 'promotion_products'); }
    public function categories(): BelongsToMany { return $this->belongsToMany(Category::class, 'promotion_categories'); }
    public function referralReward(): HasOne { return $this->hasOne(ReferralReward::class); }
}
