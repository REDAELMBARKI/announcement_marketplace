<?php

namespace App\Services\Admin;

use App\DTO\Admin\AdminAddCharityDTO;

interface AdminDashboardServiceInterface
{
    public function getAllDonations(): array;

    public function getAllUsers(): array;

    public function getDashboardStats(): array;

    public function getAllInventory(): array;

    public function getSustainabilityReport(): array;
}
