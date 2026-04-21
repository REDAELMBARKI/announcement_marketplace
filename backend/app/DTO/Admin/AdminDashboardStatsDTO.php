<?php

namespace App\DTO\Admin;

class AdminDashboardStatsDTO
{
    public function __construct(
        public int $totalProducts,
        public int $totalDonations,
        public float $totalCO2Saved,
        public int $activeCharities,
        public int $totalUsers,
        public int $activeProducts,
        public array $donationDates,
    ) {}

    public function toArray(): array
    {
        return [
            'totalProducts' => $this->totalProducts,
            'totalDonations' => $this->totalDonations,
            'totalCO2Saved' => $this->totalCO2Saved,
            'activeCharities' => $this->activeCharities,
            'totalUsers' => $this->totalUsers,
            'activeProducts' => $this->activeProducts,
            'donationDates' => $this->donationDates,
        ];
    }
}
