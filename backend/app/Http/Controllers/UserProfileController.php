<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DomainUser;
use Illuminate\Support\Facades\Hash;

class UserProfileController extends Controller
{
    // gets user profile
    public function show($id)
    {
        $user = DomainUser::find($id);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'user' => [
                'name' => $user->user_name,
                'email' => $user->user_email,
            ]
        ]);
    }

    // updates user profile
    public function update(Request $request, $id)
    {
        $user = DomainUser::find($id);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'password' => 'nullable|string|min:6',
        ]);

        $user->user_name = $request->name;
        $user->user_email = $request->email;

        if ($request->filled('password')) {
            $user->user_password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'user' => [
                'name' => $user->user_name,
                'email' => $user->user_email,
            ]
        ]);
    }
}
