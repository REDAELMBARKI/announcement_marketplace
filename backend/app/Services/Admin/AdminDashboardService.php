<?php

namespace App\Services\Admin;

use App\DTO\Admin\AdminCharityDTO;
use App\DTO\Admin\AdminDashboardStatsDTO;
use App\DTO\Admin\AdminDonationDTO;
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

    public function getAllCharities(): array
    {
        return $this->repository
            ->getDonatedProductsForCharities()
            ->map(fn ($product) => AdminCharityDTO::fromProduct($product)->toArray())
            ->unique('id')
            ->values()
            ->all();
    }

    public function getAllUsers(): array
    {
        return $this->repository->getAllUsers()->values()->all();
    }

    public function getDashboardStats(): array
    {
        $totalDonations = $this->repository->countDonatedProducts();

        $dto = new AdminDashboardStatsDTO(
            totalProducts: $this->repository->countAllProducts(),
            totalDonations: $totalDonations,
            totalCO2Saved: round($totalDonations * 1.5, 1),
            activeCharities: $totalDonations,
            totalUsers: $this->repository->countAllUsers(),
            activeProducts: $this->repository->countActiveProducts(),
            donationDates: $this->repository->getRecentDonationsDates(),
        );

        return $dto->toArray();
    }
}
