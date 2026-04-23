<?php

namespace App\Services\Admin;

use App\DTO\Admin\AdminDashboardStatsDTO;
use App\DTO\Admin\AdminDonationDTO;
use App\DTO\Admin\AdminInventoryDTO;
use App\Repositories\Admin\AdminDashboardRepositoryInterface;
use Illuminate\Support\Facades\Hash;

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
        $totalItemsDonated = $this->repository->countTotalDonatedItems();
        $totalItemsAccepted = $this->repository->countDonatedProducts();

        $dto = new AdminDashboardStatsDTO(
            totalProducts: $this->repository->countAllProducts(),
            totalDonations: $totalItemsDonated,
            totalCO2Saved: round($totalItemsAccepted * 1.5, 1),
            activeCharities: 0,
            totalUsers: $this->repository->countAllUsers(),
            activeProducts: $totalItemsAccepted,
            donationDates: $this->repository->getRecentDonationsDates(),
            userDates: $this->repository->getRecentUserRegistrationDates(),
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
}
