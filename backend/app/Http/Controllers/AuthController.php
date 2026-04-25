<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;

class AuthController extends Controller
{
    
     //login
     
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        //find user by email
        $user = User::where('email', $request->email)->first();

        if ($user && Hash::check($request->password, $user->password)) {

            // Load user with role relationship
            $user->load('role');
            
            $userData = $user->toArray();

            return response()->json([
                'status' => 'success',
                'user'   => $userData,
            ]);
        }

        return response()->json([
            'status'  => 'error',
            'message' => 'Invalid credentials',
        ], 401);
    }

    //signup
    public function signup(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email'    => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        //manual duplicate check
        if (User::where('email', $request->email)->exists()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'An account with this email already exists.',
            ], 409);
        }

        //get user role
        $userRole = Role::where('slug', 'user')->first();

        // Create user
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role_id'  => $userRole->id,
        ]);

        // Load role relationship
        $user->load('role');

        return response()->json([
            'status' => 'success',
            'user'   => $user,
        ]);
    }

    //logout
    public function logout()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully',
        ]);
    }
}
