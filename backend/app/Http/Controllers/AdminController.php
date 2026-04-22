<?php

namespace App\Http\Controllers;

use App\Services\Admin\AdminDashboardServiceInterface;

//controller for managing donations, charities, users, and dashboard stats
class AdminController extends Controller
{
    public function __construct(
        private readonly AdminDashboardServiceInterface $adminDashboardService
    ) {}

    private function successResponse($data, array $legacy = [])
    {
        return response()->json(array_merge([
            'success' => true,
            'data' => $data,
        ], $legacy));
    }

    // getting all donations (extracted from products with listing_mode = 'donate')
    public function getAllDonations()
    {
        $formattedDonations = $this->adminDashboardService->getAllDonations();

        return $this->successResponse($formattedDonations, [
            'status' => 'success',
            'donations' => $formattedDonations,
        ]);
    }

    //getting all charities (extracted from products with listing_mode = 'donate' and status = 'donated')
    public function getAllCharities()
    {
        $charities = $this->adminDashboardService->getAllCharities();

        return $this->successResponse($charities, [
            'status' => 'success',
            'charities' => $charities,
        ]);
    }

    // get all users 
    public function getAllUsers()
    {
        $users = $this->adminDashboardService->getAllUsers();

        return $this->successResponse($users, [
            'status' => 'success',
            'users' => $users,
        ]);
    }

    // metrics for all the charts
    public function getDashboardStats()
    {
        $stats = $this->adminDashboardService->getDashboardStats();

        return $this->successResponse($stats, [
            'status' => 'success',
            'stats' => $stats,
        ]);
    }
}
