<?php

namespace App\Services\Admin;

use App\DTO\Admin\AdminDashboardStatsDTO;
use App\DTO\Admin\AdminDonationDTO;
use App\DTO\Admin\AdminAnnouncementFunnelDTO;
use App\DTO\Admin\AdminAnnouncementTypeSplitDTO;
use App\DTO\Admin\AdminInventoryDTO;
use App\DTO\Admin\AdminPendingModerationItemDTO;
use App\DTO\Admin\AdminTopCategoryDTO;
use App\DTO\Admin\AdminUserRetentionDTO;
use App\Repositories\Admin\AdminDashboardRepositoryInterface;

class AdminDashboardService implements AdminDashboardServiceInterface
{
    public function __construct(
        private readonly AdminDashboardRepositoryInterface $repository
    ) {}

    public function getAllDonations(): array
    {
        return $this->repository
            ->getDonationProducts()
            ->map(fn ($product) => AdminDonationDTO::fromProduct($product)->toArray())
            ->values()
            ->all();
    }

    public function getAllUsers(): array
    {
        return $this->repository->getAllUsers()->values()->all();
    }

    public function getDashboardStats(): array
    {
        $dto = new AdminDashboardStatsDTO(
            total_announcements: $this->repository->countTotalAnnouncements(),
            active_announcements: $this->repository->countActiveAnnouncements(),
            pending_moderation: $this->repository->countPendingModeration(),
            new_users_today: $this->repository->countNewUsersToday(),
            donation_trends: $this->repository->getDonationTrend(),
            user_trends: $this->repository->getUserTrend(),
        );

        return $dto->toArray();
    }

    public function getAllInventory(): array
    {
        return $this->repository
            ->getAllInventoryItems()
            ->map(fn ($item) => AdminInventoryDTO::fromProductItem($item)->toArray())
            ->values()
            ->all();
    }

    public function getSustainabilityReport(): array
    {
        return $this->repository->getSustainabilityStats();
    }

    public function getAnnouncementTypeSplit(): array
    {
        $dto = new AdminAnnouncementTypeSplitDTO(
            donations: $this->repository->countDonationAnnouncements(),
            sales: $this->repository->countSaleAnnouncements(),
        );

        return $dto->toArray();
    }

    public function getAnnouncementFunnel(): array
    {
        $funnel = $this->repository->getAnnouncementFunnelCounts();
        $dto = new AdminAnnouncementFunnelDTO(
            posted: (int) ($funnel['posted'] ?? 0),
            active: (int) ($funnel['active'] ?? 0),
            contacted: (int) ($funnel['contacted'] ?? 0),
            closed: (int) ($funnel['closed'] ?? 0),
        );

        return $dto->toArray();
    }

    public function getTopCategories(): array
    {
        return collect($this->repository->getTopCategories())
            ->map(fn ($row) => new AdminTopCategoryDTO(
                category: (string) ($row['category'] ?? 'Unknown'),
                count: (int) ($row['count'] ?? 0),
            ))
            ->map(fn (AdminTopCategoryDTO $dto) => $dto->toArray())
            ->values()
            ->all();
    }

    public function getUserRetention(): array
    {
        $retention = $this->repository->getUserRetentionStatsForCurrentMonth();

        $dto = new AdminUserRetentionDTO(
            new_users: (int) ($retention['new_users'] ?? 0),
            returning_users: (int) ($retention['returning_users'] ?? 0),
        );

        return $dto->toArray();
    }

    public function getHourlyActivity(): array
    {
        return $this->repository->getHourlyActivityForToday();
    }

    public function getPendingModerationAnnouncements(int $limit = 5): array
    {
        return $this->repository
            ->getPendingModerationAnnouncements($limit)
            ->map(fn ($product) => AdminPendingModerationItemDTO::fromProduct($product)->toArray())
            ->values()
            ->all();
    }
}
