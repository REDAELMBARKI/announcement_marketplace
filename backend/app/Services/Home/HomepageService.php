<?php

namespace App\Services\Home;

use App\DTOs\Home\HomepageDataDTO;
use App\Http\Requests\Home\GetHomepageDataRequest;
use App\Repositories\Home\HomepageRepositoryInterface;
use Illuminate\Support\Facades\Cache;

class HomepageService
{
    public function __construct(
        private readonly HomepageRepositoryInterface $repository
    ) {}

    public function getHomepageData(GetHomepageDataRequest $request): HomepageDataDTO
    {
        $cacheKey = 'homepage_data_' . md5(json_encode([
            'city' => $request->getCity(),
            'age' => $request->getAge(),
            'category_id' => $request->getCategoryId(),
        ]));

        return Cache::remember($cacheKey, 300, function () use ($request) {
            $filters = [
                'city' => $request->getCity(),
                'age' => $request->getAge(),
                'category_id' => $request->getCategoryId(),
            ];

            return new HomepageDataDTO(
                stats: $this->repository->getStats(),
                featuredCategories: $this->repository->getFeaturedCategories()->toArray(),
                popularProducts: $this->repository->getPopularProducts($filters)->toArray(),
                newArrivals: $this->repository->getNewArrivals()->toArray(),
                productsByCategory: $this->repository->getAllProductsByCategory(),
                donationCauses: $this->repository->getDonationCauses()->toArray(),
                trendingTags: $this->repository->getTrendingTags()->toArray(),
                topSellers: $this->repository->getTopSellers()->toArray(),
                recentReviews: $this->repository->getRecentReviews()->toArray(),
                nearbyProducts: $request->getCity() 
                    ? $this->repository->getNearbyProducts($request->getCity())->toArray()
                    : [],
                freeItems: $this->repository->getFreeItems()->toArray(),
                boostedListings: $this->repository->getBoostedListings()->toArray(),
            );
        });
    }

    /**
     * Clear all homepage cache keys
     */
    public function clearHomepageCache(): void
    {
        // For now, we'll use a simple approach to clear cache
        // In production with Redis, this would be more sophisticated
        Cache::flush();
    }

    /**
     * Clear specific homepage cache keys by pattern
     */
    public function clearCacheByPattern(string $pattern): void
    {
        // For now, we'll use a simple approach to clear cache
        // In production with Redis, this would be more sophisticated
        Cache::flush();
    }
}
