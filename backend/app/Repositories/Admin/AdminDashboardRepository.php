<?php

namespace App\Repositories\Admin;

use App\Models\Product;
use App\Models\ProductItem;
use Illuminate\Support\Facades\DB;
use App\Models\User;
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
}
