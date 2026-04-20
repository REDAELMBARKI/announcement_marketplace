<?php

namespace App\DTOs\Home;

readonly class HomepageDataDTO
{
    public function __construct(
        public array $stats,
        public array $featuredCategories,
        public array $popularProducts,
        public array $newArrivals,
        public array $productsByCategory,
        public array $donationCauses,
        public array $trendingTags,
        public array $topSellers,
        public array $recentReviews,
        public array $nearbyProducts,
        public array $freeItems,
        public array $boostedListings,
    ) {}
}
