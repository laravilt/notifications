<?php

namespace Laravilt\Notifications\Concerns;

trait HasPosition
{
    protected ?string $position = 'top-right';

    public function position(?string $position): static
    {
        $this->position = $position;

        return $this;
    }

    public function getPosition(): ?string
    {
        return $this->position;
    }
}
