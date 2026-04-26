<?php

namespace App\DTO\Admin;

class AdminAnnouncementFunnelDTO
{
    public function __construct(
        public int $posted,
        public int $active,
        public int $contacted,
        public int $closed,
    ) {}

    public function toArray(): array
    {
        return [
            'posted' => $this->posted,
            'active' => $this->active,
            'contacted' => $this->contacted,
            'closed' => $this->closed,
        ];
    }
}
