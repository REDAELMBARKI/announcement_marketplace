<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use App\Models\Conversation;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Models\Address;
use App\Models\Category;

class ReportController extends Controller
{
    private function success(array $data): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function donations(): JsonResponse
    {
        $rows = Product::query()
            ->where('listing_mode', 'donate')
            ->get(['created_at'])
            ->groupBy(fn ($product) => $product->created_at?->format('Y-m-d'))
            ->map(fn ($group, $date) => [
                'date' => $date,
                'donations_count' => $group->count(),
            ])
            ->sortBy('date')
            ->values()
            ->all();

        return $this->success($rows);
    }

    public function users(): JsonResponse
    {
        $rows = User::query()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($user) => [
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'registered_at' => $user->created_at?->toDateString(),
            ])
            ->values()
            ->all();

        return $this->success($rows);
    }

    public function topUsers(): JsonResponse
    {
        $rows = User::query()
            ->leftJoin('products', 'users.id', '=', 'products.user_id')
            ->select(
                'users.id',
                'users.name',
                DB::raw("SUM(CASE WHEN products.listing_mode = 'sell' THEN 1 ELSE 0 END) as sales_count"),
                DB::raw("SUM(CASE WHEN products.listing_mode = 'donate' THEN 1 ELSE 0 END) as donations_count"),
                DB::raw("COUNT(products.id) as total_listings")
            )
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total_listings')
            ->limit(20)
            ->get()
            ->map(fn ($row) => [
                'user_id' => (int) $row->id,
                'name' => (string) $row->name,
                'sales_count' => (int) $row->sales_count,
                'donations_count' => (int) $row->donations_count,
                'total_listings' => (int) $row->total_listings,
                'best_type' => ((int) $row->sales_count >= (int) $row->donations_count) ? 'seller' : 'donater',
            ])
            ->values()
            ->all();

        return $this->success($rows);
    }

    public function userActivity(): JsonResponse
    {
        $rows = User::query()
            ->leftJoin('products', 'users.id', '=', 'products.user_id')
            ->select(
                'users.id',
                'users.name',
                DB::raw("COUNT(products.id) as total_posts"),
                DB::raw("SUM(CASE WHEN products.listing_mode = 'sell' THEN 1 ELSE 0 END) as sales_posts"),
                DB::raw("SUM(CASE WHEN products.listing_mode = 'donate' THEN 1 ELSE 0 END) as donation_posts"),
                DB::raw("COALESCE(SUM(products.views_count), 0) as total_views"),
                DB::raw("MAX(products.created_at) as last_posted_at")
            )
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total_posts')
            ->get()
            ->map(fn ($row) => [
                'user_id' => (int) $row->id,
                'name' => (string) $row->name,
                'total_posts' => (int) $row->total_posts,
                'sales_posts' => (int) $row->sales_posts,
                'donation_posts' => (int) $row->donation_posts,
                'total_views' => (int) $row->total_views,
                'last_posted_at' => $row->last_posted_at,
            ])
            ->values()
            ->all();

        return $this->success($rows);
    }

    public function usersByCity(): JsonResponse
    {
        $userAddressType = User::class;

        $rows = User::query()
            ->leftJoin('addresses', function ($join) use ($userAddressType) {
                $join->on('users.id', '=', 'addresses.addressable_id')
                    ->where('addresses.addressable_type', '=', $userAddressType);
            })
            ->select(
                DB::raw("COALESCE(addresses.city, 'Unknown') as city"),
                DB::raw('COUNT(users.id) as users_count')
            )
            ->groupBy('city')
            ->orderByDesc('users_count')
            ->get()
            ->map(fn ($row) => [
                'city' => (string) $row->city,
                'users_count' => (int) $row->users_count,
            ])
            ->values()
            ->all();

        return $this->success($rows);
    }

    public function sales(): JsonResponse
    {
        $rows = Product::query()
            ->where('listing_mode', 'sell')
            ->get(['created_at'])
            ->groupBy(fn ($product) => $product->created_at?->format('Y-m-d'))
            ->map(fn ($group, $date) => [
                'date' => $date,
                'sales_count' => $group->count(),
            ])
            ->sortBy('date')
            ->values()
            ->all();

        return $this->success($rows);
    }

    public function listingsPerformance(): JsonResponse
    {
        $contactCounts = Conversation::query()
            ->select('product_id', DB::raw('COUNT(*) as contacts'))
            ->groupBy('product_id')
            ->pluck('contacts', 'product_id');

        $rows = Product::query()
            ->orderByDesc('views_count')
            ->limit(100)
            ->get(['id', 'title', 'views_count'])
            ->map(fn ($product) => [
                'product' => (string) $product->title,
                'views' => (int) $product->views_count,
                'contacts' => (int) ($contactCounts[$product->id] ?? 0),
            ])
            ->values()
            ->all();

        return $this->success($rows);
    }

    public function inventoryByCategory(): JsonResponse
    {
        $rows = Category::query()
            ->leftJoin('products', 'categories.id', '=', 'products.super_category_id')
            ->select(
                'categories.name as category',
                DB::raw('COUNT(products.id) as products_count')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('products_count')
            ->get()
            ->map(fn ($row) => [
                'category' => (string) $row->category,
                'products_count' => (int) $row->products_count,
            ])
            ->values()
            ->all();

        return $this->success($rows);
    }

    public function timeBased(): JsonResponse
    {
        $products = Product::query()->get(['created_at']);

        $hourly = $products
            ->groupBy(fn ($product) => (int) $product->created_at?->format('H'))
            ->map(fn ($group, $hour) => [
                'hour' => (int) $hour,
                'posts_count' => $group->count(),
            ])
            ->sortBy('hour')
            ->values()
            ->all();

        $daily = $products
            ->groupBy(fn ($product) => $product->created_at?->format('l'))
            ->map(fn ($group, $day) => [
                'day' => (string) $day,
                'posts_count' => $group->count(),
            ])
            ->sortByDesc('posts_count')
            ->values()
            ->all();

        $bestHour = collect($hourly)->sortByDesc('posts_count')->first();
        $bestDay = collect($daily)->first();

        return $this->success([
            'summary' => [
                'best_hour' => $bestHour['hour'] ?? null,
                'best_hour_posts' => $bestHour['posts_count'] ?? 0,
                'best_day' => $bestDay['day'] ?? null,
                'best_day_posts' => $bestDay['posts_count'] ?? 0,
            ],
            'hourly' => $hourly,
            'daily' => $daily,
        ]);
    }

    public function all(): JsonResponse
    {
        return $this->success([
            'users_report' => $this->users()->getData(true)['data'],
            'top_users_report' => $this->topUsers()->getData(true)['data'],
            'user_activity_report' => $this->userActivity()->getData(true)['data'],
            'location_report' => $this->usersByCity()->getData(true)['data'],
            'sales_report' => $this->sales()->getData(true)['data'],
            'donations_report' => $this->donations()->getData(true)['data'],
            'listings_performance_report' => $this->listingsPerformance()->getData(true)['data'],
            'inventory_report' => $this->inventoryByCategory()->getData(true)['data'],
            'time_based_report' => $this->timeBased()->getData(true)['data'],
        ]);
    }
}
