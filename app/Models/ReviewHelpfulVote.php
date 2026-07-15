<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewHelpfulVote extends Model
{
    protected $fillable = ['product_review_id', 'user_id'];
    public function review(): BelongsTo { return $this->belongsTo(ProductReview::class, 'product_review_id'); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
