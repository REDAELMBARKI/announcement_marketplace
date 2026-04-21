<?php

namespace App\Repositories\Admin;

use App\Models\Product;
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

    public function getDonatedProductsForCharities(): Collection
    {
        return Product::query()
            ->where('listing_mode', 'donate')
            ->where('status', 'donated')
            ->with(['categories', 'user'])
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

    public function countDonatedProducts(): int
    {
        return Product::query()
            ->where('listing_mode', 'donate')
            ->where('status', 'donated')
            ->count();
    }

    public function countAllUsers(): int
    {
        return User::query()->count();
    }

    public function countActiveProducts(): int
    {
        return Product::query()->where('status', 'active')->count();
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
}
