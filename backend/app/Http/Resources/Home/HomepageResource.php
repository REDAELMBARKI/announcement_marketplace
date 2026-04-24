<?php

namespace App\Http\Resources\Home;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HomepageResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'stats' => $this->resource->stats,
            'featured_categories' => $this->resource->featuredCategories,
            'popular_products' => $this->resource->popularProducts,
            'new_arrivals' => $this->resource->newArrivals,
            'products_by_category' => (object)$this->resource->productsByCategory,
            'trending_tags' => $this->resource->trendingTags,
            'top_sellers' => $this->resource->topSellers,
            'recent_reviews' => $this->resource->recentReviews,
            'nearby_products' => $this->resource->nearbyProducts,
            'free_items' => $this->resource->freeItems,
            'boosted_listings' => $this->resource->boostedListings,
        ];
    }
}
