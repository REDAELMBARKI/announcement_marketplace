<?php

namespace App\Services;

use App\Repositories\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use App\Models\Product;
use App\Models\Favorite;

class ProductService
{
    public function __construct(
        protected ProductRepositoryInterface $productRepository
    ) {}

    public function toggleFavorite(int $userId, int $productId): array
    {
        $product = Product::findOrFail($productId);
        
        $favorite = Favorite::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($favorite) {
            $favorite->delete();
            $product->decrement('favorites_count');
            $message = 'Removed from favorites';
            $isFavorited = false;
        } else {
            Favorite::create([
                'user_id' => $userId,
                'product_id' => $productId
            ]);
            $product->increment('favorites_count');
            $message = 'Added to favorites';
            $isFavorited = true;
        }

        return [
            'message' => $message,
            'is_favorited' => $isFavorited,
            'favorites_count' => $product->favorites_count
        ];
    }

    public function getActiveProducts(): Collection
    {
        return $this->productRepository->getAllActive();
    }

    public function getProductDetails(int $id): ?Product
    {
        $product = $this->productRepository->getById($id);
        if ($product) {
            $product->increment('views_count');
        }
        return $product;
    }

    public function getUserAnnouncements(int $userId): Collection
    {
        return $this->productRepository->getByUserId($userId);
    }

    public function deleteAnnouncement(int $id): bool
    {
        return $this->productRepository->delete($id);
    }
}
