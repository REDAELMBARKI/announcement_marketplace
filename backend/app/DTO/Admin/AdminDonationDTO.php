<?php

namespace App\DTO\Admin;

use App\Models\Product;

class AdminDonationDTO
{
    public function __construct(
        public int $id,
        public string $title,
        public ?string $description,
        public string $listing_mode,
        public string $donation_date,
        public string $donation_status,
        public int $donor_ID,
        public mixed $donor,
        public array $items,
        public mixed $charity,
        public string $status,
        public string $created_at,
        public string $updated_at,
    ) {}

    public static function fromProduct(Product $product): self
    {
        $mappedStatus = match ($product->status) {
            'active', 'pending' => 'Pending',
            'donated', 'approved' => 'Approved',
            'rejected', 'declined' => 'Declined',
            default => ucfirst((string) $product->status),
        };

        return new self(
            id: $product->id,
            title: $product->title,
            description: $product->description,
            listing_mode: (string) $product->listing_mode,
            donation_date: $product->created_at?->format('Y-m-d') ?? now()->format('Y-m-d'),
            donation_status: $mappedStatus,
            donor_ID: (int) $product->user_id,
            donor: $product->user,
            items: $product->items?->values()->all() ?? [],
            charity: $product->categories?->first(),
            status: (string) $product->status,
            created_at: $product->created_at?->toDateTimeString() ?? now()->toDateTimeString(),
            updated_at: $product->updated_at?->toDateTimeString() ?? now()->toDateTimeString(),
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'listing_mode' => $this->listing_mode,
            'donation_date' => $this->donation_date,
            'donation_status' => $this->donation_status,
            'donor_ID' => $this->donor_ID,
            'donor' => $this->donor,
            'items' => $this->items,
            'charity' => $this->charity,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
