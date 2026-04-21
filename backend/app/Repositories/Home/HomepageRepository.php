<?php

namespace App\Repositories\Home;

use App\Models\Category;
use App\Models\Product;
use App\Models\Tag;
use App\Models\User;
use App\Models\Review;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class HomepageRepository implements HomepageRepositoryInterface
{
    public function __construct(
        private Category $category,
        private Product $product
    ) {}
    public function getStats(): array
    {
        return [
            'total_products' => Product::where('status', 'active')->count(),
            'total_users' => User::count(),
            'total_donations' => Product::where('listing_mode', 'donate')->where('status', 'active')->count(),
        ];
    }

    public function getFeaturedCategories(): Collection
    {
        return Category::select(['id', 'name', 'slug', 'icon', 'sort_order'])
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->withCount(['products' => function ($query) {
                $query->where('status', 'active');
            }])
            ->orderBy('sort_order')
            ->get();
    }

    public function getPopularProducts(array $filters): Collection
    {
        $query = Product::select([
            'id', 'title', 'price', 'listing_mode', 'age_range', 'condition',
            'views_count', 'favorites_count', 'created_at', 'user_id'
        ])
            ->with(['user:id,name', 'categories:id,name,slug', 'addresses', 'thumbnail'])
            ->where('status', 'active')
            ->orderBy('views_count', 'desc')
            ->limit(10);

        if (!empty($filters['age'])) {
            $query->where('age_range', $filters['age']);
        }

        if (!empty($filters['category_id'])) {
            $query->whereHas('categories', function ($q) use ($filters) {
                $q->where('categories.id', $filters['category_id']);
            });
        }

        return $query->get();
    }

    public function getNewArrivals(): Collection
    {
        return Product::select([
            'id', 'title', 'price', 'listing_mode', 'age_range', 'condition',
            'views_count', 'favorites_count', 'created_at', 'user_id'
        ])
            ->with(['user:id,name', 'categories:id,name,slug', 'addresses', 'thumbnail'])
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
    }

    public function getProductsByCategory(int $categoryId, int $limit = 10): Collection
    {
        return Product::select([
            'id', 'title', 'price', 'listing_mode', 'age_range', 'condition',
            'views_count', 'favorites_count', 'created_at', 'user_id'
        ])
            ->with(['user:id,name', 'categories:id,name,slug', 'addresses', 'thumbnail'])
            ->where('status', 'active')
            ->whereHas('categories', function ($q) use ($categoryId) {
                $q->where('categories.id', $categoryId);
            })
            ->orderBy('views_count', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getAllProductsByCategory(): array
    {
        $categories = Category::whereNull('parent_id')->where('is_active', true)->get();
        $result = [];
        
        foreach ($categories as $category) {
            $products = Product::select([
                'id', 'title', 'price', 'listing_mode', 'age_range', 'condition',
                'views_count', 'favorites_count', 'created_at', 'user_id'
            ])
                ->with(['user:id,name', 'categories:id,name,slug', 'addresses', 'thumbnail'])
                ->where('status', 'active')
                ->whereHas('categories', function ($q) use ($category) {
                    $q->where('categories.id', $category->id);
                })
                ->orderBy('views_count', 'desc')
                ->limit(10)
                ->get();
                
            $result[$category->id] = $products->toArray();
        }
        
        return $result;
    }

    public function getDonationCauses(): Collection
    {
        return Product::select([
            'id', 'title', 'description', 'age_range', 'condition',
            'views_count', 'favorites_count', 'created_at', 'user_id'
        ])
            ->with(['user:id,name', 'addresses' => function ($query) {
                $query->select(['addressable_id', 'addressable_type', 'city', 'district'])
                    ->where('addressable_type', Product::class);
            }])
            ->where('listing_mode', 'donate')
            ->where('status', 'active')
            ->orderBy('created_at', 'asc')
            ->limit(10)
            ->get();
    }

    public function getTrendingTags(): Collection
    {
        return Tag::select(['tags.id', 'tags.name', 'tags.slug'])
            ->join('product_tag', 'tags.id', '=', 'product_tag.tag_id')
            ->join('products', 'product_tag.product_id', '=', 'products.id')
            ->where('products.status', 'active')
            ->groupBy('tags.id', 'tags.name', 'tags.slug')
            ->orderByRaw('COUNT(product_tag.product_id) DESC')
            ->limit(15)
            ->get();
    }

    public function getTopSellers(): Collection
    {
        return User::select(['users.id', 'users.name'])
            ->withCount(['products' => function ($query) {
                $query->where('status', 'active');
            }])
            ->leftJoin('reviews', 'users.id', '=', 'reviews.reviewed_id')
            ->selectRaw('users.*, AVG(reviews.rating) as avg_rating, COUNT(reviews.id) as total_reviews')
            ->groupBy('users.id', 'users.name')
            ->orderBy('avg_rating', 'desc')
            ->orderBy('total_reviews', 'desc')
            ->limit(6)
            ->get();
    }

    public function getRecentReviews(): Collection
    {
        return Review::select([
            'reviews.id', 'reviews.rating', 'reviews.comment', 'reviews.created_at',
            'reviewer.id as reviewer_id', 'reviewer.name as reviewer_name',
            'products.id as product_id', 'products.title as product_title'
        ])
            ->join('users as reviewer', 'reviews.reviewer_id', '=', 'reviewer.id')
            ->join('products', 'reviews.product_id', '=', 'products.id')
            ->orderBy('reviews.created_at', 'desc')
            ->limit(10)
            ->get();
    }

    public function getNearbyProducts(string $city): Collection
    {
        return Product::select([
            'id', 'title', 'price', 'listing_mode', 'age_range', 'condition',
            'views_count', 'favorites_count', 'created_at', 'user_id'
        ])
            ->with(['user:id,name', 'addresses' => function ($query) use ($city) {
                $query->select(['addressable_id', 'addressable_type', 'city', 'district'])
                    ->where('addressable_type', Product::class)
                    ->where('city', $city);
            }])
            ->whereHas('addresses', function ($query) use ($city) {
                $query->where('addressable_type', Product::class)->where('city', $city);
            })
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
    }

    public function getFreeItems(): Collection
    {
        return Product::select([
            'id', 'title', 'age_range', 'condition', 'views_count',
            'favorites_count', 'created_at', 'user_id'
        ])
            ->with(['user:id,name', 'categories:id,name,slug'])
            ->where('listing_mode', 'donate')
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
    }

    public function getBoostedListings(): Collection
    {
        return Product::select([
            'id', 'title', 'price', 'listing_mode', 'age_range', 'condition',
            'views_count', 'favorites_count', 'created_at', 'user_id'
        ])
            ->with(['user:id,name', 'categories:id,name,slug'])
            ->where('is_boosted', true)
            ->where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
    }
}
