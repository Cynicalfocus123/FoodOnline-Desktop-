<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReturnMedia extends Model
{
    use HasPublicUuid;
    protected $appends = ['url', 'upload_uuid'];
    protected $hidden = ['upload'];
    protected $fillable = ['uuid', 'return_request_id', 'media_upload_id', 'path', 'alt_text', 'sort_order'];
    public function request(): BelongsTo { return $this->belongsTo(ReturnRequest::class, 'return_request_id'); }
    public function upload(): BelongsTo { return $this->belongsTo(MediaUpload::class, 'media_upload_id'); }
    public function getUrlAttribute(): ?string { return app(\App\Services\Catalog\CategoryMediaUrl::class)->make($this->path); }
    public function getUploadUuidAttribute(): ?string { return $this->upload?->uuid; }
}
