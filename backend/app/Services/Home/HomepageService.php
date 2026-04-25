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
            featuredCategories: $this->repository->getFeaturedCategories(),
            popularProducts: $this->repository->getPopularProducts($filters),
            newArrivals: $this->repository->getNewArrivals(),
            productsByCategory: $this->repository->getAllProductsByCategory(),
            trendingTags: $this->repository->getTrendingTags(),
            topSellers: $this->repository->getTopSellers(),
            recentReviews: $this->repository->getRecentReviews(),
            nearbyProducts: $request->getCity()
                ? $this->repository->getNearbyProducts($request->getCity())
                : collect([]),
            freeItems: $this->repository->getFreeItems(),
            boostedListings: $this->repository->getBoostedListings(),
            heroSliders: $this->repository->getHeroSliders(),
            banners: $this->repository->getBanners(),
        );
    }
}
