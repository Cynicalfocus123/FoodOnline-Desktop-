<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CategoryAlias extends Model
{
    protected $fillable = ['category_id', 'alias_slug', 'redirect_code', 'is_active', 'created_by'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'redirect_code' => 'integer'];
    }

    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
}
