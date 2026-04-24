<?php

namespace App\DTO\Admin;

class AdminUserRetentionDTO
{
    public function __construct(
        public int $new_users,
        public int $returning_users,
    ) {}

    public function toArray(): array
    {
        return [
            'new_users' => $this->new_users,
            'returning_users' => $this->returning_users,
        ];
    }
}
