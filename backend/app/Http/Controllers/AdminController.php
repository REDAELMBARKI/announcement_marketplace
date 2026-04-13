<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Charity;
use App\Models\DomainUser;
use Illuminate\Http\Request;

//controller for managing donations, charities, users, and dashboard stats
class AdminController extends Controller
{
    // getting all donations (with their items + charity + donor)

    public function getAllDonations()
    {
        $donations = Donation::with(['items', 'charity', 'donor'])
            ->orderBy('donation_date', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'donations' => $donations
        ]);
    }

    //getting all charities
    public function getAllCharities()
    {
        $charities = Charity::all();
        return response()->json([
            'status' => 'success',
            'charities' => $charities
        ]);
    }

    // get all users 
    public function getAllUsers()
    {
        try{
            //fetch all users  
        $users = DomainUser::all();
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
        $donations = Donation::with(['items', 'charity'])->get();

        //total donations
        $total = $donations->count();

        // cO2 saved = donations * 1.5
        $co2 = round($total * 1.5, 1);

        // count of charities that are active
        $activeCharities = $donations->groupBy('charity_ID')->count();

        //format donation labels
        $donation_labels = $donations->take(10)->pluck('donation_date');

        return response()->json([
            'status' => 'success',
            'stats' => [
                'totalDonations'     => $total,
                'totalCO2Saved'      => $co2,
                'activeCharities'    => $activeCharities,
                'donationDates'      => $donation_labels,
            ],
            'donations' => $donations
        ]);
    }
}
