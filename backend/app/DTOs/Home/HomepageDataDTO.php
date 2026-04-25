<?php

namespace App\DTOs\Home;

use Illuminate\Support\Collection;

readonly class HomepageDataDTO
{
    public function __construct(
        public array $stats,
        public Collection|array $featuredCategories,
        public Collection|array $popularProducts,
        public Collection|array $newArrivals,
        public array $productsByCategory,
        public Collection|array $trendingTags,
        public Collection|array $topSellers,
        public Collection|array $recentReviews,
        public Collection|array $nearbyProducts,
        public Collection|array $freeItems,
        public Collection|array $boostedListings,
    ) {}
}
