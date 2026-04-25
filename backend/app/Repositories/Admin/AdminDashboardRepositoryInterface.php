<?php

namespace App\Repositories\Admin;

use Illuminate\Support\Collection;

interface AdminDashboardRepositoryInterface
{
    public function getDonationProducts(): Collection;

    public function getAllUsers(): Collection;

    public function countAllProducts(): int;

    public function countTotalDonatedItems(): int;

    public function countDonatedProducts(): int;

    public function countAllUsers(): int;

    public function countActiveProducts(): int;

    public function getRecentDonationsDates(int $limit = 10): array;

    public function getRecentUserRegistrationDates(int $limit = 10): array;

    public function getAllInventoryItems(): Collection;
    public function getSustainabilityStats(): array;

    public function countTotalAnnouncements(): int;

    public function countActiveAnnouncements(): int;

    public function countPendingModeration(): int;

    public function countNewUsersToday(): int;

    public function countDonationAnnouncements(): int;

    public function countSaleAnnouncements(): int;

    public function getAnnouncementFunnelCounts(): array;

    public function getTopCategories(int $limit = 6): array;

    public function getUserRetentionStatsForCurrentMonth(): array;

    public function getHourlyActivityForToday(): array;

    public function getPendingModerationAnnouncements(int $limit = 5): Collection;

    public function getDonationTrend(int $months = 6): array;

    public function getUserTrend(int $months = 6): array;
}
