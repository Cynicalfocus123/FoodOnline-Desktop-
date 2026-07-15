<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;

class OrderStatusHistory extends Model
{
    use HasPublicUuid;
    public const UPDATED_AT = null;
    protected $guarded = [];
    protected function casts(): array { return ['metadata' => 'array']; }
}
