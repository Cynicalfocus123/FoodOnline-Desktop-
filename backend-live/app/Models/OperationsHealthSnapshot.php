<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OperationsHealthSnapshot extends Model
{
    protected $fillable = ['key', 'status', 'message', 'last_checked_at', 'metadata'];
    protected function casts(): array { return ['last_checked_at' => 'datetime', 'metadata' => 'array']; }
}
