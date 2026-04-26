<?php

namespace App\DTO\Admin;

class AdminAnnouncementTypeSplitDTO
{
    public function __construct(
        public int $donations,
        public int $sales,
    ) {}

    public function toArray(): array
    {
        return [
            'donations' => $this->donations,
            'sales' => $this->sales,
        ];
    }
}
