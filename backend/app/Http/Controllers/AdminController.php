<?php

namespace App\Http\Controllers;

use App\DTO\Admin\AdminAddCharityDTO;
use App\Services\Admin\AdminDashboardServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    // get all inventory items
    public function getAllInventory()
    {
        $inventory = $this->adminDashboardService->getAllInventory();

        return $this->successResponse($inventory, [
            'status' => 'success',
            'inventory' => $inventory,
        ]);
    }

    // get sustainability report
    public function getSustainabilityReport()
    {
        $report = $this->adminDashboardService->getSustainabilityReport();

        return $this->successResponse($report, [
            'status' => 'success',
            'report' => $report,
        ]);
    }
}
