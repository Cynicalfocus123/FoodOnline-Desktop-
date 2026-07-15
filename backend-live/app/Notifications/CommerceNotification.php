<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class CommerceNotification extends Notification implements ShouldQueue
{
    use Queueable;
    public function __construct(private readonly string $event, private readonly string $title, private readonly string $message, private readonly array $link = []) {}
    public function via(object $notifiable): array { return ['database']; }
    public function toDatabase(object $notifiable): DatabaseMessage { return new DatabaseMessage(['event' => $this->event, 'title' => $this->title, 'message' => $this->message, 'link' => $this->link]); }
}
