<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MediaUpload extends Model
{
    public const PURPOSES = ['product_image', 'brand_logo', 'category_image', 'category_icon', 'category_desktop_banner', 'category_mobile_banner', 'review_image', 'return_evidence', 'support_attachment'];
    public const STATUSES = ['pending', 'finalized', 'expired', 'cleanup_pending', 'deleted'];

    protected $fillable = [
        'uuid', 'purpose', 'target_type', 'target_id', 'target_field', 'product_media_id', 'disk', 'object_key',
        'original_filename', 'expected_mime_type', 'expected_size_bytes', 'actual_mime_type', 'actual_size_bytes',
        'width', 'height', 'status', 'expires_at', 'finalized_at', 'cleanup_attempted_at', 'cleanup_error', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'expected_size_bytes' => 'integer', 'actual_size_bytes' => 'integer', 'width' => 'integer', 'height' => 'integer',
            'expires_at' => 'datetime', 'finalized_at' => 'datetime', 'cleanup_attempted_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string { return 'uuid'; }
    public function productMedia(): BelongsTo { return $this->belongsTo(ProductMedia::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function reviewMedia(): HasMany { return $this->hasMany(ReviewMedia::class); }
    public function returnMedia(): HasMany { return $this->hasMany(ReturnMedia::class); }
    public function supportMedia(): HasMany { return $this->hasMany(SupportMedia::class); }
}
