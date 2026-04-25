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
            'total_products' => Product::whereIn('status', ['sell', 'donate'])->count(),
            'total_users' => User::count(),
            'total_donations' => Product::where('listing_mode', 'donate')->where('status', 'donate')->count(),
        ];
    }

    public function getFeaturedCategories(): Collection
    {
        return Category::select(['id', 'name', 'slug', 'icon', 'sort_order'])
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->with(['thumbnail'])
            ->withCount(['superCategoryProducts as products_count' => function ($query) {
                $query->whereIn('status', ['sell', 'donate']);
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
            ->whereIn('status', ['sell', 'donate'])
            ->orderBy('views_count', 'desc')
            ->limit(10);

        if (!empty($filters['age'])) {
            $query->where('age_range', $filters['age']);
        }

        if (!empty($filters['category_id'])) {
            $query->where('super_category_id', $filters['category_id']);
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
            ->whereIn('status', ['sell', 'donate'])
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
            ->whereIn('status', ['sell', 'donate'])
            ->where('super_category_id', $categoryId)
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
                ->whereIn('status', ['sell', 'donate'])
                ->where('super_category_id', $category->id)
                ->orderBy('views_count', 'desc')
                ->limit(10)
                ->get();
                
            $result[$category->id] = $products;
        }
        
        return $result;
    }

    public function getTrendingTags(): Collection
    {
        return Tag::select(['tags.id', 'tags.name', 'tags.slug'])
            ->join('product_tag', 'tags.id', '=', 'product_tag.tag_id')
            ->join('products', 'product_tag.product_id', '=', 'products.id')
            ->whereIn('products.status', ['sell', 'donate'])
            ->groupBy('tags.id', 'tags.name', 'tags.slug')
            ->orderByRaw('COUNT(product_tag.product_id) DESC')
            ->limit(15)
            ->get();
    }

    public function getTopSellers(): Collection
    {
        return User::select('users.id', 'users.name')
            ->selectRaw('COALESCE(AVG(reviews.rating), 0) as avg_rating, COUNT(reviews.id) as total_reviews')
            ->withCount(['products' => function ($query) {
                $query->whereIn('status', ['sell', 'donate']);
            }])
            ->leftJoin('reviews', 'users.id', '=', 'reviews.reviewed_id')
            ->groupBy('users.id', 'users.name')
            ->orderBy('avg_rating', 'desc')
            ->orderBy('total_reviews', 'desc')
            ->limit(6)
            ->get();
    }

    public function getRecentReviews(): Collection
    {
        return Review::with(['reviewer:id,name', 'product:id,title'])
            ->orderBy('created_at', 'desc')
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
            ->whereIn('status', ['sell', 'donate'])
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
            ->where('status', 'donate')
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
            ->with(['user:id,name', 'categories:id,name,slug', 'thumbnail'])
            ->whereIn('status', ['sell', 'donate'])
            ->orderBy('views_count', 'desc')
            ->limit(10)
            ->get();
    }
}
