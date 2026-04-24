<?php

namespace App\Services\Home;

use App\DTOs\Home\HomepageDataDTO;
use App\Http\Requests\Home\GetHomepageDataRequest;
use App\Repositories\Home\HomepageRepositoryInterface;

class HomepageService
{
    public function __construct(
        private readonly HomepageRepositoryInterface $repository
    ) {}

    public function getHomepageData(GetHomepageDataRequest $request): HomepageDataDTO
    {
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
            trendingTags: $this->repository->getTrendingTags()->toArray(),
            topSellers: $this->repository->getTopSellers()->toArray(),
            recentReviews: $this->repository->getRecentReviews()->toArray(),
            nearbyProducts: $request->getCity()
                ? $this->repository->getNearbyProducts($request->getCity())->toArray()
                : [],
            freeItems: $this->repository->getFreeItems()->toArray(),
            boostedListings: $this->repository->getBoostedListings()->toArray(),
        );
    }
}
