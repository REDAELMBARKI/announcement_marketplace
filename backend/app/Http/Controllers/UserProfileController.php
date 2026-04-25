<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserProfileController extends Controller
{
    public function show(Request $request, int $id): JsonResponse
    {
        if ((int) $id !== (int) $request->user('api')?->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden',
            ], 403);
        }

        $user = User::find($id);

        if (! $user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found',
            ], 404);
        }

        $avatarUrl = $user->avatar_path
            ? asset('storage/'.ltrim($user->avatar_path, '/'))
            : null;

        return response()->json([
            'status' => 'success',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $avatarUrl,
            ],
        ]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $user = $request->user('api');
        if (! $user instanceof User) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'avatar' => ['required', 'image', 'max:4096'],
        ]);

        $path = $request->file('avatar')->store('avatars/'.$user->id, 'public');

        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $user->avatar_path = $path;
        $user->save();

        return response()->json([
            'status' => 'success',
            'avatar_url' => asset('storage/'.$path),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        if ((int) $id !== (int) $request->user('api')?->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden',
            ], 403);
        }

        $user = User::find($id);

        if (! $user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found',
            ], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
        ]);

        if ($request->filled('password')) {
            $request->validate([
                'password' => 'required|string|min:6|confirmed',
            ]);
            $user->password = Hash::make($request->password);
        }

        $user->name = $request->name;
        $user->email = $request->email;

        $user->save();

        return response()->json([
            'status' => 'success',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }
}
