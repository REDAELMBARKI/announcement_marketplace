<?php

namespace App\DTO\Admin;

use App\Models\Product;

class AdminCharityDTO
{
    public function __construct(
        public int $id,
        public string $name,
        public ?string $description,
        public string $donation_date,
        public mixed $donor,
        public string $status,
        public string $created_at,
        public string $updated_at,
    ) {}

    public static function fromProduct(Product $product): self
    {
        return new self(
            id: $product->id,
            name: (string) ($product->categories?->first()?->name ?? 'Unknown Charity'),
            description: $product->description,
            donation_date: $product->created_at?->format('Y-m-d') ?? now()->format('Y-m-d'),
            donor: $product->user,
            status: (string) $product->status,
            created_at: $product->created_at?->toDateTimeString() ?? now()->toDateTimeString(),
            updated_at: $product->updated_at?->toDateTimeString() ?? now()->toDateTimeString(),
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'donation_date' => $this->donation_date,
            'donor' => $this->donor,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
