<?php

namespace App\Http\Controllers;

use App\Models\Charity;
use App\Models\DomainUser;
use App\Models\CharityStaff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CharityController extends Controller
{
    //get all charities
    public function index()
    {
        return response()->json(Charity::all());
    }

    // get single charity with staff, donations, and inventory
    public function show($id)
    {
        return response()->json(
            Charity::with(['staff', 'donations', 'inventory'])->findOrFail($id)
        );
    }

    // create a new charity and its staff
    public function store(Request $request)
    {
        //validate the input
        $request->validate([
            'charity_name'     => 'required|string',
            'charity_address'  => 'required|string',
            'charity_email'    => 'required|email',
            'contact_person'   => 'required|string',
            'staff_username'   => 'required|string',
            'staff_email'      => 'required|email',
            'staff_password'   => 'required|string|min:6',
        ]);

        try {
            // check if the charity email already exists
            if (Charity::where('charity_email', $request->charity_email)->exists()) {
                return response()->json(['status' => 'error', 'message' => 'Charity email already exists.'], 409);
            }

            // create the charity
            $charity = Charity::create([
                'charity_name'    => $request->charity_name,
                'charity_address' => $request->charity_address,
                'charity_email'   => $request->charity_email,
                'contact_person'  => $request->contact_person,
            ]);

            // try to find existing user by email
            $user = DomainUser::where('user_email', $request->staff_email)->first();

            // if user doesn't exist then create a new one
            if (!$user) {
                $user = DomainUser::create([
                    'user_name'     => $request->staff_username,
                    'user_email'    => $request->staff_email,
                    'user_password' => password_hash($request->staff_password, PASSWORD_DEFAULT),
                    'role_id'       => 11, //charity staff role
                ]);
            }

            // check if this user is already linked to the charity
            $linkExists = CharityStaff::where('charity_ID', $charity->charity_ID)
                ->where('user_ID', $user->user_ID)
                ->exists();

            // if the link does not exist, create it
            if (!$linkExists) {
                CharityStaff::create([
                    'charity_ID' => $charity->charity_ID,
                    'user_ID'    => $user->user_ID,
                ]);
            }

            // return success response
            return response()->json([
                'status' => 'success',
                'message' => 'Charity created successfully. Staff linked successfully.',
                'charity' => $charity,
                'staff'   => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create charity: ' . $e->getMessage()
            ], 500);
        }
    }

    // update an existing charity
    public function update(Request $request, $id)
    {
        $request->validate([
            'charity_name'     => 'required|string',
            'charity_address'  => 'required|string',
            'charity_email'    => 'required|email',
            'contact_person'   => 'required|string',
        ]);

        try {
            $charity = Charity::findOrFail($id);

            // prevents duplicate charity email
            if (Charity::where('charity_email', $request->charity_email)
                ->where('charity_ID', '<>', $id)
                ->exists()
            ) {
                return response()->json(['status' => 'error', 'message' => 'Charity email already exists.'], 409);
            }

            $charity->update([
                'charity_name'    => $request->charity_name,
                'charity_address' => $request->charity_address,
                'charity_email'   => $request->charity_email,
                'contact_person'  => $request->contact_person,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Charity updated successfully',
                'charity' => $charity,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update charity: ' . $e->getMessage()
            ], 500);
        }
    }

    // deletes a charity and its staff links
public function destroy($id)
{
    try {
        $charity = Charity::with('donations')->findOrFail($id);

        // stop deletion if donations exist
        if ($charity->donations()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'You cannot delete this charity because it has donations attached to it.'
            ], 409);
        }

        // remove any staff that are linked
        CharityStaff::where('charity_ID', $id)->delete();

        // delete the charity
        $charity->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Charity account deleted successfully.'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to delete charity: ' . $e->getMessage()
        ], 500);
    }
}


    // get simplified list of charities for dropdowns
    public function getCharitiesList()
    {
        try {
            $charities = DB::table('Charity')
                ->select('charity_ID as id', 'charity_name as name')
                ->orderBy('charity_name')
                ->get();

            return response()->json(['status' => 'success', 'charities' => $charities]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch charities: ' . $e->getMessage()
            ], 500);
        }
    }
}
