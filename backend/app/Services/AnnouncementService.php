<?php

namespace App\Services;

use App\Repositories\AnnouncementRepository;
use App\Repositories\FilterAttributeRepository;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AnnouncementService
{
    public function __construct(
        protected AnnouncementRepository $announcementRepository,
        protected FilterAttributeRepository $filterAttributeRepository
    ) {}

    public function createAnnouncement(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            $product = $this->announcementRepository->create([
                'user_id'           => $data['user_id'],
                'super_category_id' => $data['super_category_id'],
                'listing_mode'      => $data['listing_mode'],
                'listing_type'      => $data['listing_type'],
                'title'             => $data['title'],
                'description'       => $data['description'] ?? null,
                'price'             => $data['price'] ?? 0,
                'currency'          => $data['currency'] ?? 'MAD',
                'price_negotiable'  => $data['price_negotiable'] ?? false,
                'status'            => 'sell', // Default status
                'condition'         => $data['condition'] ?? null,
                'gender'            => $data['gender'] ?? null,
                'age_range'         => $data['age_range'] ?? null,
                'brand'             => $data['brand'] ?? null,
                'season'            => $data['season'] ?? null,
                'sizes'             => $this->parseListField($data['sizes'] ?? null),
                'colors'            => $this->parseListField($data['colors'] ?? null),
                'pickup_address'    => $data['pickup_address'] ?? null,
                'handover_method'   => $data['handover_method'] ?? 'pickup',
            ]);

            // Sync sub-categories if provided
            if (!empty($data['sub_category_ids'])) {
                $product->subCategories()->sync($data['sub_category_ids']);
            }

            // Link media
            if (!empty($data['media_ids'])) {
                $this->announcementRepository->linkMediaToProduct($data['media_ids'], $product);
            }

            // Create basic product item
            $this->announcementRepository->createProductItem([
                'product_id'      => $product->id,
                'item_name'       => $product->title,
                'item_condition'  => $product->condition,
                'item_gender'     => $product->gender,
                'recommended_age' => $product->age_range,
                'item_brand'      => $product->brand,
                'item_season'     => $product->season,
                'item_quantity'   => 1,
                'item_sizes'      => $product->sizes,
                'item_colors'     => $product->colors,
            ]);

            return $product;
        });
    }

    protected function parseListField($value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map('trim', $value), fn ($entry) => $entry !== ''));
        }

        if (is_string($value) && $value !== '') {
            return array_values(array_filter(array_map('trim', explode(',', $value)), fn ($entry) => $entry !== ''));
        }

        return [];
    }

    public function getMarketplaceInitData(): array
    {
        $categories = Category::whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name as label', 'icon', 'slug']);

        $attributes = $this->filterAttributeRepository->getAllGrouped();

        return [
            'categories' => $categories,
            'cities' => $attributes->get('cities', []),
            'ageRanges' => $attributes->get('ageRanges', []),
            'clothingSizes' => $attributes->get('clothingSizes', []),
            'shoeSizes' => $attributes->get('shoeSizes', []),
            'conditions' => $attributes->get('conditions', []),
            'listingTypes' => $attributes->get('listingTypes', []),
        ];
    }

    public function getMarketplaceListings(array $filters, int $perPage = 12): LengthAwarePaginator
    {
        return $this->announcementRepository->getMarketplaceListings($filters, $perPage);
    }
}
