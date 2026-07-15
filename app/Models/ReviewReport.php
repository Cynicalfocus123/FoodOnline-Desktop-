<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewReport extends Model
{
    use HasPublicUuid;
    protected $fillable = ['uuid', 'product_review_id', 'user_id', 'reason_code', 'details', 'status', 'moderator_note', 'resolved_by', 'resolved_at'];
    protected function casts(): array { return ['resolved_at' => 'datetime']; }
    public function review(): BelongsTo { return $this->belongsTo(ProductReview::class, 'product_review_id'); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
