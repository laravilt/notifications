<?php

namespace Laravilt\Notifications;

use Illuminate\Contracts\Support\Arrayable;
use Laravilt\Notifications\Concerns\CanBeDismissed;
use Laravilt\Notifications\Concerns\HasBody;
use Laravilt\Notifications\Concerns\HasColor;
use Laravilt\Notifications\Concerns\HasDuration;
use Laravilt\Notifications\Concerns\HasIcon;
use Laravilt\Notifications\Concerns\HasTitle;

class Notification implements Arrayable
{
    use CanBeDismissed;
    use HasBody;
    use HasColor;
    use HasDuration;
    use HasIcon;
    use HasTitle;

    protected ?string $id = null;

    protected string $status = 'info';

    protected array $actions = [];

    protected array $data = [];

    final public function __construct()
    {
        $this->id = uniqid('notification_');
    }

    public static function make(): static
    {
        return app(static::class);
    }

    public static function success(): static
    {
        return static::make()
            ->status('success')
            ->icon('heroicon-o-check-circle')
            ->color('success');
    }

    public static function danger(): static
    {
        return static::make()
            ->status('danger')
            ->icon('heroicon-o-x-circle')
            ->color('danger');
    }

    public static function warning(): static
    {
        return static::make()
            ->status('warning')
            ->icon('heroicon-o-exclamation-triangle')
            ->color('warning');
    }

    public static function info(): static
    {
        return static::make()
            ->status('info')
            ->icon('heroicon-o-information-circle')
            ->color('info');
    }

    public function status(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function actions(array $actions): static
    {
        $this->actions = $actions;

        return $this;
    }

    public function data(array $data): static
    {
        $this->data = $data;

        return $this;
    }

    public function send(): static
    {
        session()->flash('laravilt.notification', $this->toArray());

        return $this;
    }

    public function sendToDatabase(mixed $notifiable): void
    {
        $notifiable->notify(new DatabaseNotification($this));
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function getActions(): array
    {
        return $this->actions;
    }

    public function getData(): array
    {
        return $this->data;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->getId(),
            'status' => $this->getStatus(),
            'title' => $this->getTitle(),
            'body' => $this->getBody(),
            'icon' => $this->getIcon(),
            'color' => $this->getColor(),
            'duration' => $this->getDuration(),
            'persistent' => $this->isPersistent(),
            'dismissible' => $this->isDismissible(),
            'actions' => $this->getActions(),
            'data' => $this->getData(),
        ];
    }
}
