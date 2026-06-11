<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    
     //login
     
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // unified auth on users table
        $user = User::where('email', $request->email)->first();

        if ($user && Hash::check($request->password, $user->password)) {
            $user->load('role'); // Load role relationship

            $avatarUrl = null;
            if (! empty($user->avatar_path)) {
                $avatarUrl = asset('storage/'.ltrim($user->avatar_path, '/'));
            }

            $userData = [
                'id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'role_id' => $user->role->id,
                'role' => $user->role ? $user->role->name : 'user',
                'claims' => $user->role ? $user->role->claims : [],
                'avatar_url' => $avatarUrl,
            ];

            // Use Sanctum for token generation
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'token' => $token,
                    'user' => $userData,
                ],
                'status' => 'success',
                'user'   => $userData,
                'token' => $token,
            ]);
        }

        return response()->json([
            'success' => false,
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
                'success' => false,
                'status'  => 'error',
                'message' => 'An account with this email already exists.',
            ], 409);
        }

        // default role 10 = donor
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => 10,
        ]);

        $user->load('role');

        $token = $user->createToken('auth_token')->plainTextToken;

        $userData = [
            'id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email,
            'role_id' => $user->role_id,
            'role' => $user->role ? $user->role->name : 'donor',
            'claims' => $user->role ? $user->role->claims : [],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token,
                'user' => $userData,
            ],
            'status' => 'success',
            'user'   => $userData,
            'token' => $token,
        ], 201);
    }

    //logout
    public function logout(Request $request)
    {
        try {
            // Use Sanctum to delete the current token
            $request->user()->currentAccessToken()->delete();
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to logout',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => null,
            'status' => 'success',
            'message' => 'Logged out successfully',
        ]);
    }

    // Get current user
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('role');
        
        $userData = $user->toArray();
        $userData['role'] = $user->role ? $user->role->name : null;

        return response()->json([
            'status' => 'success',
            'user'   => $userData,
        ]);
    }
}
