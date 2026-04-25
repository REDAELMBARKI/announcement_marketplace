<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Tymon\JWTAuth\Facades\JWTAuth;

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
            $avatarUrl = null;
            if (! empty($user->avatar_path)) {
                $avatarUrl = asset('storage/'.ltrim($user->avatar_path, '/'));
            }

            $userData = [
                'id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'role_id' => $user->role_id,
                'avatar_url' => $avatarUrl,
            ];

            $token = JWTAuth::fromUser($user);

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

    //signup older versio 
    public function signup(Request $request)
    {
        $request->validate([
            'fullName' => 'required|string|max:255',
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

        // default role 10 = donor (frontend-compatible)
        $user = User::create([
            'name' => $request->fullName,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => 10,
        ]);

        $userData = [
            'id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email,
            'role_id' => $user->role_id,
        ];

        return response()->json([
            'success' => true,
            'data' => $userData,
            'status' => 'success',
            'user'   => $userData,
        ]);
    }

    //logout
    public function logout()
    {
        try {
            JWTAuth::parseToken()->invalidate(true);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'data' => null,
            'status' => 'success',
            'message' => 'Logged out successfully',
        ]);
    }
}
