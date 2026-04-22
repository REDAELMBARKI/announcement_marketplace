<?php

namespace App\Repositories;

use App\Models\Product;
use App\Models\ProductItem;
use App\Models\Media;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class AnnouncementRepository
{
    public function create(array $data): Product
    {
        return Product::create($data);
    }

    public function linkMediaToProduct(array $mediaIds, Product $product): void
    {
        Media::whereIn('id', $mediaIds)
            ->whereNull('mediable_id')
            ->update([
                'mediable_id' => $product->id,
                'mediable_type' => Product::class,
                'is_temporary' => false,
            ]);
    }

    public function createProductItem(array $data): ProductItem
    {
        return ProductItem::create($data);
    }

    public function getMarketplaceListings(array $filters, int $perPage = 12): LengthAwarePaginator
    {
        $query = Product::with(['user', 'thumbnail', 'gallery', 'superCategory', 'subCategories'])
            ->whereIn('status', ['sell', 'donate']);

        // Search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Category filter
        if (!empty($filters['category'])) {
            $query->where('super_category_id', $filters['category']);
        }

        // Listing mode filter (sell/donate)
        if (!empty($filters['mode']) && $filters['mode'] !== 'all') {
            $query->where('listing_mode', $filters['mode']);
        }

        // Age range filter
        if (!empty($filters['age_range'])) {
            $query->where('age_range', $filters['age_range']);
        }

        // Gender filter
        if (!empty($filters['gender'])) {
            $query->where('gender', $filters['gender']);
        }

        // Condition filter
        if (!empty($filters['condition'])) {
            $query->where('condition', $filters['condition']);
        }

        // Price filters
        if (!empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }
        if (!empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }
        if (!empty($filters['free_only']) && $filters['free_only'] === true) {
            $query->where('listing_mode', 'donate');
        }

        // Sorting
        $sort = $filters['sort'] ?? 'newest';
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        return $query->paginate($perPage);
    }
}
