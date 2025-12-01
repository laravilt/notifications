<?php

namespace Laravilt\Notifications\Concerns;

trait CanBeDismissed
{
    protected bool $isDismissible = true;

    public function dismissible(bool $condition = true): static
    {
        $this->isDismissible = $condition;

        return $this;
    }

    public function isDismissible(): bool
    {
        return $this->isDismissible;
    }
}
