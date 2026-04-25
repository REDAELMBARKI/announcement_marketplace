<?php

namespace App\Repositories\Admin;

use App\Models\Product;
use App\Models\ProductItem;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AdminDashboardRepository implements AdminDashboardRepositoryInterface
{
    public function getDonationProducts(): Collection
    {
        return Product::query()
            ->where('listing_mode', 'donate')
            ->where('status', '!=', 'draft')
            ->with(['user', 'categories', 'items', 'addresses', 'thumbnail'])
            ->orderByDesc('created_at')
            ->get();
    }

    public function getAllUsers(): Collection
    {
        return User::query()->get();
    }

    public function countAllProducts(): int
    {
        return Product::query()->count();
    }

    public function countTotalDonatedItems(): int
    {
        return Product::query()->where('listing_mode', 'donate')->count();
    }

    public function countDonatedProducts(): int
    {
        return Product::query()
            ->where('listing_mode', 'donate')
            ->whereIn('status', ['donated', 'approved'])
            ->count();
    }

    public function countAllUsers(): int
    {
        return User::query()->count();
    }

    public function countActiveProducts(): int
    {
        return Product::query()
            ->whereIn('status', ['active', 'pending', 'donate', 'sell'])
            ->count();
    }

    public function getRecentDonationsDates(int $limit = 10): array
    {
        return Product::query()
            ->where('listing_mode', 'donate')
            ->where('status', 'donated')
            ->orderByDesc('created_at')
            ->take($limit)
            ->pluck('created_at')
            ->map(fn ($date) => $date?->format('Y-m-d'))
            ->filter()
            ->values()
            ->all();
    }

    public function getRecentUserRegistrationDates(int $limit = 10): array
    {
        return User::query()
            ->orderByDesc('created_at')
            ->take($limit)
            ->pluck('created_at')
            ->map(fn ($date) => $date?->format('Y-m-d'))
            ->filter()
            ->values()
            ->all();
    }

    public function getAllInventoryItems(): Collection
    {
        return ProductItem::with(['product.superCategory', 'product.user'])
            ->orderByDesc('created_at')
            ->get();
    }

    public function getSustainabilityStats(): array
    {
        $donatedProducts = $this->countDonatedProducts();

        return [
            'items_reused' => $donatedProducts,
            'co2_reduced' => round($donatedProducts * 1.5, 1),
        ];
    }

    public function countTotalAnnouncements(): int
    {
        return Product::query()->count();
    }

    public function countActiveAnnouncements(): int
    {
        return Product::query()
            ->whereIn('status', ['sell', 'donate', 'reserved'])
            ->count();
    }

    public function countPendingModeration(): int
    {
        return Product::query()
            ->where('status', 'draft')
            ->count();
    }

    public function countNewUsersToday(): int
    {
        return User::query()
            ->whereDate('created_at', Carbon::today())
            ->count();
    }

    public function countDonationAnnouncements(): int
    {
        return Product::query()->where('listing_mode', 'donate')->count();
    }

    public function countSaleAnnouncements(): int
    {
        return Product::query()->where('listing_mode', 'sell')->count();
    }

    public function getAnnouncementFunnelCounts(): array
    {
        $posted = Product::query()->where('status', '!=', 'draft')->count();
        $active = Product::query()->whereIn('status', ['sell', 'donate', 'reserved'])->count();
        $contacted = Product::query()
            ->whereExists(function ($query) {
                $query->selectRaw('1')
                    ->from('conversations')
                    ->whereColumn('conversations.product_id', 'products.id');
            })
            ->count();
        $closed = Product::query()->whereIn('status', ['sold', 'donated', 'closed'])->count();

        return [
            'posted' => $posted,
            'active' => $active,
            'contacted' => $contacted,
            'closed' => $closed,
        ];
    }

    public function getTopCategories(int $limit = 6): array
    {
        return Product::query()
            ->join('categories', 'products.super_category_id', '=', 'categories.id')
            ->select('categories.name as category', DB::raw('COUNT(products.id) as count'))
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('count')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => [
                'category' => (string) $row->category,
                'count' => (int) $row->count,
            ])
            ->all();
    }

    public function getUserRetentionStatsForCurrentMonth(): array
    {
        $startOfMonth = Carbon::now()->startOfMonth();

        $newUsers = User::query()
            ->whereDate('created_at', '>=', $startOfMonth)
            ->count();

        $returningUsers = Product::query()
            ->whereDate('created_at', '>=', $startOfMonth)
            ->whereIn('user_id', function ($query) use ($startOfMonth) {
                $query->select('id')
                    ->from('users')
                    ->whereDate('created_at', '<', $startOfMonth);
            })
            ->distinct('user_id')
            ->count('user_id');

        return [
            'new_users' => $newUsers,
            'returning_users' => $returningUsers,
        ];
    }

    public function getHourlyActivityForToday(): array
    {
        $rows = Product::query()
            ->whereDate('created_at', Carbon::today())
            ->get(['created_at']);

        $activity = array_fill(0, 24, 0);

        foreach ($rows as $row) {
            $hour = (int) $row->created_at?->format('H');
            $activity[$hour] += 1;
        }

        return $activity;
    }

    public function getPendingModerationAnnouncements(int $limit = 5): Collection
    {
        return Product::query()
            ->where('status', 'draft')
            ->with(['addresses'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public function getDonationTrend(int $months = 6): array
    {
        $fromDate = Carbon::now()->startOfMonth()->subMonths($months - 1);

        $rows = Product::query()
            ->whereDate('created_at', '>=', $fromDate)
            ->where('listing_mode', 'donate')
            ->get(['created_at'])
            ->groupBy(fn ($row) => $row->created_at?->format('Y-m'))
            ->map(fn ($group) => $group->count())
            ->all();

        $trend = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $monthDate = Carbon::now()->startOfMonth()->subMonths($i);
            $monthKey = $monthDate->format('Y-m');
            $trend[] = [
                'label' => $monthDate->format('M'),
                'count' => (int) ($rows[$monthKey] ?? 0),
            ];
        }

        return $trend;
    }

    public function getUserTrend(int $months = 6): array
    {
        $fromDate = Carbon::now()->startOfMonth()->subMonths($months - 1);

        $rows = User::query()
            ->whereDate('created_at', '>=', $fromDate)
            ->get(['created_at'])
            ->groupBy(fn ($row) => $row->created_at?->format('Y-m'))
            ->map(fn ($group) => $group->count())
            ->all();

        $trend = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $monthDate = Carbon::now()->startOfMonth()->subMonths($i);
            $monthKey = $monthDate->format('Y-m');
            $trend[] = [
                'label' => $monthDate->format('M'),
                'count' => (int) ($rows[$monthKey] ?? 0),
            ];
        }

        return $trend;
    }
}
