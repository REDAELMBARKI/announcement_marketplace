<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class ProductRepository implements ProductRepositoryInterface
{
    public function getAllActive(): Collection
    {
        return Product::with(['superCategory', 'subCategories', 'thumbnail', 'gallery', 'user'])
            ->where('status', 'active')
            ->orderByDesc('created_at')
            ->get();
    }

    public function getById(int $id): ?Product
    {
        return Product::with(['superCategory', 'subCategories', 'thumbnail', 'gallery', 'user', 'items', 'addresses'])
            ->findOrFail($id);
    }

    public function getByUserId(int $userId): Collection
    {
        return Product::with(['superCategory', 'subCategories', 'thumbnail', 'gallery'])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function delete(int $id): bool
    {
        $product = Product::find($id);
        if ($product) {
            return $product->delete();
        }
        return false;
    }
}
