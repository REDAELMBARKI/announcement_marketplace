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

    public function getAnnouncementTypeSplit(): array;

    public function getAnnouncementFunnel(): array;

    public function getTopCategories(): array;

    public function getUserRetention(): array;

    public function getHourlyActivity(): array;

    public function getPendingModerationAnnouncements(int $limit = 5): array;
}
