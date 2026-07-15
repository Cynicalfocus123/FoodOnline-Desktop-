<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;

class PromotionRedemption extends Model
{
    use HasPublicUuid;
    protected $guarded = [];
    protected function casts(): array { return ['discount_value_snapshot' => 'integer', 'discount_applied_minor' => 'integer', 'redeemed_at' => 'datetime']; }
}
