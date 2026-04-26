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
            $data['status'] = 'active'; // Default status for new announcements
            $data['sizes'] = $this->parseListField($data['sizes'] ?? null);
            $data['colors'] = $this->parseListField($data['colors'] ?? null);

            $product = $this->announcementRepository->create($data);

            $this->syncRelations($product, $data);
            $this->upsertProductItem($product, $data);

            return $product;
        });
    }

    public function updateAnnouncement(int $id, array $data): Product
    {
        return DB::transaction(function () use ($id, $data) {
            if (isset($data['sizes'])) {
                $data['sizes'] = $this->parseListField($data['sizes']);
            }
            if (isset($data['colors'])) {
                $data['colors'] = $this->parseListField($data['colors']);
            }

            $product = $this->announcementRepository->update($id, $data);

            $this->syncRelations($product, $data);
            $this->upsertProductItem($product, $data);

            return $product;
        });
    }

    protected function syncRelations(Product $product, array $data): void
    {
        // Sync sub-categories if provided
        if (isset($data['sub_category_ids'])) {
            $product->subCategories()->sync($data['sub_category_ids']);
        }

        // Link media if provided
        if (!empty($data['media_ids'])) {
            $this->announcementRepository->linkMediaToProduct($data['media_ids'], $product);
        }
    }

    protected function upsertProductItem(Product $product, array $data): void
    {
        $itemData = [
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
        ];

        $this->announcementRepository->updateProductItem($product->id, $itemData);

        // If no item exists, create one (fallback for legacy data)
        if (!$product->items()->exists()) {
            $this->announcementRepository->createProductItem($itemData);
        }
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
            ->get(['id', 'name', 'icon', 'slug']);

        $attributes = $this->filterAttributeRepository->getAllGrouped();

        return [
            'categories' => $categories,
            'cities' => $attributes->get('cities', []),
            'ageRanges' => $attributes->get('ageRanges', []),
            'clothingSizes' => $attributes->get('clothingSizes', []),
            'shoeSizes' => $attributes->get('shoeSizes', []),
            'conditions' => $attributes->get('conditions', []),
            'listingTypes' => $attributes->get('listingTypes', []),
            'materials' => $attributes->get('materials', []),
            'colors' => $attributes->get('colors', []),
        ];
    }

    public function getMarketplaceListings(array $filters, int $perPage = 12): LengthAwarePaginator
    {
        return $this->announcementRepository->getMarketplaceListings($filters, $perPage);
    }
}
