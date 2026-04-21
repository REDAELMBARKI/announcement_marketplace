<?php

namespace App\Repositories\Admin;

use Illuminate\Support\Collection;

interface AdminDashboardRepositoryInterface
{
    public function getDonationProducts(): Collection;

    public function getDonatedProductsForCharities(): Collection;

    public function getAllUsers(): Collection;

    public function countAllProducts(): int;

    public function countDonatedProducts(): int;

    public function countAllUsers(): int;

    public function countActiveProducts(): int;

    public function getRecentDonationsDates(int $limit = 10): array;
}
