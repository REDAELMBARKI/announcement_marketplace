<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    private function userId(): int
    {
        return (int) auth('api')->id();
    }

    public function stats(): JsonResponse
    {
        $userId = $this->userId();

        $totalDonated = Product::query()
            ->where('user_id', $userId)
            ->where('listing_mode', 'donate')
            ->count();

        $totalSold = Product::query()
            ->where('user_id', $userId)
            ->where('listing_mode', 'sell')
            ->whereIn('status', ['sold', 'closed'])
            ->count();

        $totalViews = (int) Product::query()
            ->where('user_id', $userId)
            ->sum('views_count');

        $totalClicks = Conversation::query()
            ->where('seller_id', $userId)
            ->count();

        return response()->json([
            'total_donated' => $totalDonated,
            'total_sold' => $totalSold,
            'total_views' => $totalViews,
            'total_clicks' => $totalClicks,
        ]);
    }

    public function activity(): JsonResponse
    {
        $userId = $this->userId();
        $start = Carbon::today()->subDays(29);

        $announcementsRaw = Product::query()
            ->where('user_id', $userId)
            ->whereDate('created_at', '>=', $start)
            ->get(['created_at'])
            ->groupBy(fn ($row) => $row->created_at?->format('Y-m-d'))
            ->map(fn ($group) => $group->count())
            ->all();

        $donationsRaw = Product::query()
            ->where('user_id', $userId)
            ->where('listing_mode', 'donate')
            ->whereDate('created_at', '>=', $start)
            ->get(['created_at'])
            ->groupBy(fn ($row) => $row->created_at?->format('Y-m-d'))
            ->map(fn ($group) => $group->count())
            ->all();

        $data = [];
        for ($i = 0; $i < 30; $i++) {
            $date = $start->copy()->addDays($i)->format('Y-m-d');
            $data[] = [
                'date' => $date,
                'donations' => (int) ($donationsRaw[$date] ?? 0),
                'announcements' => (int) ($announcementsRaw[$date] ?? 0),
            ];
        }

        return response()->json($data);
    }

    public function topAnnouncements(): JsonResponse
    {
        $userId = $this->userId();

        $contactCounts = Conversation::query()
            ->select('product_id', DB::raw('COUNT(*) as clicks'))
            ->groupBy('product_id')
            ->pluck('clicks', 'product_id');

        $rows = Product::query()
            ->where('user_id', $userId)
            ->with('thumbnail')
            ->orderByDesc('views_count')
            ->limit(3)
            ->get()
            ->map(function ($product) use ($contactCounts) {
                $thumb = $product->thumbnail;
                $imageUrl = $thumb?->url;
                if (! $imageUrl && $thumb?->path) {
                    $imageUrl = asset('storage/'.ltrim(str_replace('public/', '', $thumb->path), '/'));
                }

                return [
                    'id' => (int) $product->id,
                    'title' => (string) $product->title,
                    'image_url' => $imageUrl,
                    'views' => (int) $product->views_count,
                    'clicks' => (int) ($contactCounts[$product->id] ?? 0),
                ];
            })
            ->values()
            ->all();

        return response()->json($rows);
    }

    public function categories(): JsonResponse
    {
        $userId = $this->userId();

        $products = Product::query()
            ->where('user_id', $userId)
            ->with('superCategory')
            ->get();

        $counts = [
            'Clothes' => 0,
            'Shoes' => 0,
            'Accessories' => 0,
        ];

        foreach ($products as $product) {
            $categoryName = strtolower((string) ($product->superCategory?->name ?? ''));
            if (str_contains($categoryName, 'shoe')) {
                $counts['Shoes']++;
            } elseif (str_contains($categoryName, 'cloth') || str_contains($categoryName, 'wear')) {
                $counts['Clothes']++;
            } else {
                $counts['Accessories']++;
            }
        }

        return response()->json([
            ['category' => 'Clothes', 'count' => $counts['Clothes']],
            ['category' => 'Shoes', 'count' => $counts['Shoes']],
            ['category' => 'Accessories', 'count' => $counts['Accessories']],
        ]);
    }

    public function status(): JsonResponse
    {
        $userId = $this->userId();

        $donationProducts = Product::query()
            ->where('user_id', $userId)
            ->where('listing_mode', 'donate')
            ->get(['status']);

        $salesProducts = Product::query()
            ->where('user_id', $userId)
            ->where('listing_mode', 'sell')
            ->get(['status']);

        $donationStatus = [
            'pending' => 0,
            'scheduled' => 0,
            'completed' => 0,
        ];

        foreach ($donationProducts as $product) {
            if (in_array($product->status, ['reserved'], true)) {
                $donationStatus['scheduled']++;
            } elseif (in_array($product->status, ['donated', 'closed'], true)) {
                $donationStatus['completed']++;
            } else {
                $donationStatus['pending']++;
            }
        }

        $salesStatus = [
            'available' => 0,
            'reserved' => 0,
            'sold' => 0,
        ];

        foreach ($salesProducts as $product) {
            if (in_array($product->status, ['reserved'], true)) {
                $salesStatus['reserved']++;
            } elseif (in_array($product->status, ['sold', 'closed'], true)) {
                $salesStatus['sold']++;
            } else {
                $salesStatus['available']++;
            }
        }

        return response()->json([
            'donations' => $donationStatus,
            'sales' => $salesStatus,
        ]);
    }
}
