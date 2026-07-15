<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderAddress extends Model
{
    use HasPublicUuid;
    protected $guarded = [];
    protected function casts(): array { return ['address_values' => 'array']; }
    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
}
