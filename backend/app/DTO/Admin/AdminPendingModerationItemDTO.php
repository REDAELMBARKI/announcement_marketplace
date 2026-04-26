<?php

namespace App\DTO\Admin;

use App\Models\Product;
use Carbon\Carbon;

class AdminPendingModerationItemDTO
{
    public function __construct(
        public int $id,
        public string $type,
        public string $title,
        public string $city,
        public string $time_ago,
    ) {}

    public static function fromProduct(Product $product): self
    {
        return new self(
            id: (int) $product->id,
            type: (string) $product->listing_mode,
            title: (string) $product->title,
            city: (string) optional($product->addresses->first())->city ?: 'N/A',
            time_ago: Carbon::parse($product->created_at)->diffForHumans(),
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'city' => $this->city,
            'time_ago' => $this->time_ago,
        ];
    }
}
