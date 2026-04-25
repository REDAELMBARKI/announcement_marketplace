<?php

namespace App\Http\Resources\Home;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\ProductResource;

class HomepageResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        $productsByCategory = [];
        foreach ($this->productsByCategory ?? [] as $catId => $products) {
            $productsByCategory[$catId] = ProductResource::collection($products);
        }

        return [
            'stats' => $this->stats,
            'featured_categories' => $this->featuredCategories,
            'popular_products' => ProductResource::collection($this->popularProducts ?? []),
            'new_arrivals' => ProductResource::collection($this->newArrivals ?? []),
            'products_by_category' => (object)$productsByCategory,
            'trending_tags' => $this->trendingTags,
            'top_sellers' => $this->topSellers,
            'recent_reviews' => $this->recentReviews,
            'nearby_products' => ProductResource::collection($this->nearbyProducts ?? []),
            'free_items' => ProductResource::collection($this->freeItems ?? []),
            'boosted_listings' => ProductResource::collection($this->boostedListings ?? []),
        ];
    }
}
