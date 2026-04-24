<?php

namespace App\Repositories\Home;

use Illuminate\Support\Collection;

interface HomepageRepositoryInterface
{
    public function getStats(): array;
    public function getFeaturedCategories(): Collection;
    public function getPopularProducts(array $filters): Collection;
    public function getNewArrivals(): Collection;
    public function getProductsByCategory(int $categoryId, int $limit = 10): Collection;
    public function getAllProductsByCategory(): array;
    public function getTrendingTags(): Collection;
    public function getTopSellers(): Collection;
    public function getRecentReviews(): Collection;
    public function getNearbyProducts(string $city): Collection;
    public function getFreeItems(): Collection;
    public function getBoostedListings(): Collection;
}
