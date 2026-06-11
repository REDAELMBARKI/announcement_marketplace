<?php

namespace App\Repositories;

use App\Models\Product;
use App\Models\ProductItem;
use App\Models\Media;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class AnnouncementRepository
{
    /**
     * Common method to prepare product data.
     */
    protected function prepareProductData(array $data): array
    {
        $fields = [
            'user_id', 'super_category_id', 'listing_mode', 'listing_type',
            'title', 'description', 'price', 'currency', 'price_negotiable',
            'status', 'condition', 'gender', 'age_range', 'brand', 'season',
            'sizes', 'colors', 'handover_method', 'contact_phone'
        ];

        return array_intersect_key($data, array_flip($fields));
    }

    public function create(array $data): Product
    {
        return Product::create($this->prepareProductData($data));
    }

    public function update(int $id, array $data): Product
    {
        $product = Product::findOrFail($id);
        $product->update($this->prepareProductData($data));
        return $product;
    }

    public function linkMediaToProduct(array $mediaIds, Product $product): void
    {
        $mediaItems = Media::whereIn('id', $mediaIds)
            ->where('is_temporary', true)
            ->get();

        foreach ($mediaItems as $media) {
            $oldPath = $media->path;
            $newPath = 'products/' . basename($oldPath);

            // Move file if it exists and is in temp_media
            if (str_starts_with($oldPath, 'temp_media/') && \Illuminate\Support\Facades\Storage::disk($media->disk)->exists($oldPath)) {
                \Illuminate\Support\Facades\Storage::disk($media->disk)->move($oldPath, $newPath);
                
                $media->update([
                    'mediable_id' => $product->id,
                    'mediable_type' => Product::class,
                    'is_temporary' => false,
                    'path' => $newPath,
                    'url' => \Illuminate\Support\Facades\Storage::disk($media->disk)->url($newPath),
                ]);
            } else {
                // Fallback for media already in products or other folders
                $media->update([
                    'mediable_id' => $product->id,
                    'mediable_type' => Product::class,
                    'is_temporary' => false,
                ]);
            }
        }
    }

    public function createProductItem(array $data): ProductItem
    {
        return ProductItem::create($data);
    }

    public function updateProductItem(int $productId, array $data): void
    {
        ProductItem::where('product_id', $productId)->first()?->update($data);
    }

    public function getMarketplaceListings(array $filters, int $perPage = 12): LengthAwarePaginator
    {
        $query = Product::with(['user', 'thumbnail', 'gallery', 'superCategory', 'subCategories', 'address'])
            ->whereIn('listing_mode', ['sell', 'donate'])
            ->whereIn('status', ['published', 'draft', 'sell', 'donate']);

        // Search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // City filter
        if (!empty($filters['cities'])) {
            $query->whereHas('address', function ($q) use ($filters) {
                $q->whereIn('city_id', (array) $filters['cities']);
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
