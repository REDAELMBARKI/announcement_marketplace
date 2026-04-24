<?php

namespace App\DTO\Admin;

class AdminTopCategoryDTO
{
    public function __construct(
        public string $category,
        public int $count,
    ) {}

    public function toArray(): array
    {
        return [
            'category' => $this->category,
            'count' => $this->count,
        ];
    }
}
