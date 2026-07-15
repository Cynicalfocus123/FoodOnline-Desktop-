<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSavedItem extends Model
{
    protected $table = 'user_saved_items';
    protected $fillable = ['user_id', 'product_variant_id', 'quantity'];
    protected function casts(): array { return ['quantity' => 'integer']; }
    public function variant(): BelongsTo { return $this->belongsTo(ProductVariant::class, 'product_variant_id'); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
