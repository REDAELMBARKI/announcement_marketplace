<?php

namespace App\Http\Resources\Home;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\MediaResource;

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
            'hero_sliders' => $this->heroSliders->map(function($slider) {
                return [
                    'id' => $slider->id,
                    'headline' => $slider->headline,
                    'subline' => $slider->subline,
                    'cta1_text' => $slider->cta1_text,
                    'cta1_link' => $slider->cta1_link,
                    'cta2_text' => $slider->cta2_text,
                    'cta2_link' => $slider->cta2_link,
                    'thumbnail' => new MediaResource($slider->thumbnail),
                ];
            }),
            'banners' => $this->banners->map(function($banner) {
                return [
                    'id' => $banner->id,
                    'type' => $banner->type,
                    'title' => $banner->title,
                    'subtitle' => $banner->subtitle,
                    'badge_text' => $banner->badge_text,
                    'cta_text' => $banner->cta_text,
                    'cta_link' => $banner->cta_link,
                    'steps' => $banner->steps,
                    'thumbnail' => new MediaResource($banner->thumbnail),
                ];
            }),
        ];
    }
}
