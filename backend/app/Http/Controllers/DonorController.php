<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Donor;
use Illuminate\Http\Request;

// this controller is for managing donors
class DonorController extends Controller
{
    //get all donors
    public function index()
    {
        $donors = Donor::with(['user', 'donations'])->get();
        return response()->json($donors);
    }
    
    //get a specific donor by IDs
    public function show($id)
    {
        $donor = Donor::with(['user', 'donations'])->findOrFail($id);
        return response()->json($donor);
    }
}
