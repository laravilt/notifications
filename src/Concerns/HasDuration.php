<?php

namespace Laravilt\Notifications\Concerns;

trait HasDuration
{
    protected ?int $duration = 3000;

    protected bool $persistent = false;

    public function duration(?int $duration): static
    {
        $this->duration = $duration;

        return $this;
    }

    public function persistent(bool $condition = true): static
    {
        $this->persistent = $condition;

        return $this;
    }

    public function getDuration(): ?int
    {
        return $this->persistent ? null : $this->duration;
    }

    public function isPersistent(): bool
    {
        return $this->persistent;
    }
}
