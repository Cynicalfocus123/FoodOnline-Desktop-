<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;

class OrderStatusHistory extends Model
{
    use HasPublicUuid;
    protected $table = 'order_status_history';
    public const UPDATED_AT = null;
    protected $guarded = [];
    protected function casts(): array { return ['metadata' => 'array']; }
}
