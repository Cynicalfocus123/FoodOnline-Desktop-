<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewMedia extends Model
{
    use HasPublicUuid;
    protected $appends = ['url'];
    protected $fillable = ['uuid', 'product_review_id', 'media_upload_id', 'path', 'alt_text', 'sort_order'];
    public function review(): BelongsTo { return $this->belongsTo(ProductReview::class, 'product_review_id'); }
    public function upload(): BelongsTo { return $this->belongsTo(MediaUpload::class, 'media_upload_id'); }
    public function getUrlAttribute(): ?string { return app(\App\Services\Catalog\CategoryMediaUrl::class)->make($this->path); }
}
