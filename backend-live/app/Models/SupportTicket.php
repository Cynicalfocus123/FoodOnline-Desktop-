<?php

namespace App\Models;

use App\Models\Concerns\HasPublicUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportTicket extends Model
{
    use HasPublicUuid;
    protected $fillable = ['uuid', 'ticket_number', 'user_id', 'order_id', 'guest_email', 'subject', 'status', 'priority', 'last_message_at', 'closed_at'];
    protected function casts(): array { return ['last_message_at' => 'datetime', 'closed_at' => 'datetime']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function messages(): HasMany { return $this->hasMany(SupportMessage::class); }
    public function media(): HasMany { return $this->hasMany(SupportMedia::class); }
}
