<?php

namespace App\Services;

use App\Repositories\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use App\Models\Product;

class ProductService
{
    public function __construct(
        protected ProductRepositoryInterface $productRepository
    ) {}

    public function getActiveProducts(): Collection
    {
        return $this->productRepository.getAllActive();
    }

    public function getProductDetails(int $id): ?Product
    {
        $product = $this->productRepository.getById($id);
        if ($product) {
            $product->increment('views_count');
        }
        return $product;
    }

    public function getUserAnnouncements(int $userId): Collection
    {
        return $this->productRepository.getByUserId($userId);
    }

    public function deleteAnnouncement(int $id): bool
    {
        return $this->productRepository.delete($id);
    }
}
