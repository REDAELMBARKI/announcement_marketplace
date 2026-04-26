<?php

namespace App\DTO\Admin;

use App\Models\ProductItem;

class AdminInventoryDTO
{
    public function __construct(
        public int $id,
        public string $name,
        public string $category,
        public int $quantity,
        public string $condition,
        public ?string $recommended_age,
        public ?string $gender,
        public string $created_at,
        public ?string $image_url = null
    ) {}

    public static function fromProductItem(ProductItem $item): self
    {
        return new self(
            id: $item->id,
            name: $item->item_name,
            category: $item->product?->superCategory?->name ?? 'Unknown',
            quantity: (int) $item->item_quantity,
            condition: (string) $item->item_condition,
            recommended_age: $item->recommended_age,
            gender: $item->item_gender,
            created_at: $item->created_at?->toDateTimeString() ?? now()->toDateTimeString(),
            image_url: $item->product?->media->first()?->file_path
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'quantity' => $this->quantity,
            'condition' => $this->condition,
            'recommended_age' => $this->recommended_age,
            'gender' => $this->gender,
            'created_at' => $this->created_at,
            'image_url' => $this->image_url,
        ];
    }
}
