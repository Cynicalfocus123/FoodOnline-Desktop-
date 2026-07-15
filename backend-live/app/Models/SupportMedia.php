<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportMedia extends Model
{
    use HasPublicUuid;
    protected $fillable = ['uuid', 'support_ticket_id', 'support_message_id', 'media_upload_id', 'path', 'alt_text', 'sort_order'];
    public function ticket(): BelongsTo { return $this->belongsTo(SupportTicket::class, 'support_ticket_id'); }
    public function message(): BelongsTo { return $this->belongsTo(SupportMessage::class, 'support_message_id'); }
}
