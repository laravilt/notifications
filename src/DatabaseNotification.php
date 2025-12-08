<?php

declare(strict_types=1);

namespace Laravilt\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification as BaseNotification;

class DatabaseNotification extends BaseNotification implements ShouldQueue
{
    use Queueable;

    protected Notification $notification;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->notification->getTitle(),
            'body' => $this->notification->getBody(),
            'icon' => $this->notification->getIcon(),
            'icon_color' => $this->notification->getColor(),
            'status' => $this->notification->getStatus(),
            'color' => $this->notification->getColor(),
            'actions' => $this->notification->getActions(),
            'data' => $this->notification->getData(),
            'format' => 'laravilt',
        ];
    }

    /**
     * Get the type of the notification being broadcast.
     */
    public function databaseType(object $notifiable): string
    {
        return 'laravilt';
    }
}
