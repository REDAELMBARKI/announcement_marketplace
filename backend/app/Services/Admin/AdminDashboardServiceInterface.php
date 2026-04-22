<?php

namespace App\Services\Admin;

interface AdminDashboardServiceInterface
{
    public function getAllDonations(): array;

    public function getAllCharities(): array;

    public function getAllUsers(): array;

    public function getDashboardStats(): array;
}
