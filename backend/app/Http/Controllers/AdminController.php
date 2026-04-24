<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

//controller for managing donations, charities, users, and dashboard stats
class AdminController extends Controller
{
    // getting all donations (extracted from products with listing_mode = 'donate')
    public function getAllDonations()
    {
        // Get products that are donations
        $donations = Product::where('listing_mode', 'donate')
            ->where('status', '!=', 'draft')
            ->with(['user', 'categories', 'addresses', 'thumbnail'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform products into donation format
        $formattedDonations = $donations->map(function ($product) {
            return [
                'id' => $product->id,
                'title' => $product->title,
                'description' => $product->description,
                'donation_date' => $product->created_at->format('Y-m-d'),
                'donor' => $product->user,
                'items' => $product->items ?? [],
                'charity' => $product->categories->first() ?? null,
                'status' => $product->status,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ];
        });

        return response()->json([
            'status' => 'success',
            'donations' => $formattedDonations
        ]);
    }

    //getting all charities (extracted from products with listing_mode = 'donate' and status = 'donated')
    public function getAllCharities()
    {
        // Get products that are donated and have charity info
        $charityProducts = Product::where('listing_mode', 'donate')
            ->where('status', 'donated')
            ->with(['categories', 'user'])
            ->get();

        // Extract unique charities from donated products
        $charities = $charityProducts->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->categories->first()?->name ?? 'Unknown Charity',
                'description' => $product->description,
                'donation_date' => $product->created_at->format('Y-m-d'),
                'donor' => $product->user,
                'status' => $product->status,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ];
        })->unique('id');

        return response()->json([
            'status' => 'success',
            'charities' => $charities->values()
        ]);
    }

    // get all users 
    public function getAllUsers()
    {
        try{
            //fetch all users  
            $users = User::all();
            return response()->json([
                'status' => 'success',
                'users' => $users
            ]);

        }catch(\Exception $e) {
            return response()->json([
                'error'=> $e->getMessage()
            ], 500);
            
        }
    }

    // metrics for all the charts
    public function getDashboardStats()
    {
        // Get statistics from Product model
        $totalProducts = Product::count();
        $totalDonations = Product::where('listing_mode', 'donate')->where('status', 'donated')->count();
        $totalUsers = \App\Models\User::count();
        $totalActiveProducts = Product::whereIn('status', ['sell', 'donate'])->count();
        
        // Get recent donation dates from donated products
        $recentDonations = Product::where('listing_mode', 'donate')
            ->where('status', 'donated')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->pluck('created_at')
            ->map(function ($date) {
                return $date->format('Y-m-d');
            });

        return response()->json([
            'status' => 'success',
            'stats' => [
                'totalProducts'       => $totalProducts,
                'totalDonations'     => $totalDonations,
                'totalCO2Saved'      => round($totalDonations * 1.5, 1),
                'activeCharities'    => $totalDonations, // Using donated products as proxy for charities
                'totalUsers'         => $totalUsers,
                'activeProducts'      => $totalActiveProducts,
                'donationDates'      => $recentDonations,
            ],
        ]);
    }
}
