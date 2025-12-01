<?php

namespace Laravilt\Notifications\Concerns;

trait HasBody
{
    protected ?string $body = null;

    public function body(?string $body): static
    {
        $this->body = $body;

        return $this;
    }

    public function getBody(): ?string
    {
        return $this->body;
    }
}
