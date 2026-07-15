<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;

class OrderNote extends Model
{
    use HasPublicUuid;
    protected $guarded = [];
    protected function casts(): array { return ['customer_visible' => 'boolean']; }
}
