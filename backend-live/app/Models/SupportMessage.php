<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportMessage extends Model
{
    use HasPublicUuid;
    protected $fillable = ['uuid', 'support_ticket_id', 'user_id', 'admin_user_id', 'body', 'attachments', 'customer_visible'];
    protected function casts(): array { return ['attachments' => 'array', 'customer_visible' => 'boolean']; }
    public function ticket(): BelongsTo { return $this->belongsTo(SupportTicket::class, 'support_ticket_id'); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function admin(): BelongsTo { return $this->belongsTo(User::class, 'admin_user_id'); }
}
