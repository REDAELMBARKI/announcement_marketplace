<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Charity;
use Illuminate\Http\Request;

class ViewUserController extends Controller
{
    // this gets all users with their roles
    public function getViewUsers()
    {
        $users = User::with('role')->get()->map(function($user) {
            return [
                'user_ID' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'role_id' => $user->role_id,
                'role_name' => $user->role?->role_name ?? 'user',
                'created_date' => $user->created_at->format('Y-m-d'),
            ];
        });
        return response()->json(['status'=>'success','users'=>$users]);
    }

    // gets all roles
    public function getRoles()
    {
        $roles = Role::all();
        return response()->json(['status'=>'success','roles'=>$roles]);
    }

    // gets list of charities
    public function getCharitiesList()
    {
        $charities = Charity::all();
        return response()->json(['status'=>'success','charities'=>$charities]);
    }

    // updates user
    public function updateUser(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['status'=>'error','message'=>'User not found'],404);

        $data = $request->only(['name', 'email', 'role_id']);
        
        // Map role_name to role_id if provided (for compatibility with some frontend logic)
        if ($request->has('role_name')) {
            $role = Role::where('role_name', $request->role_name)->first();
            if ($role) {
                $data['role_id'] = $role->role_ID;
            }
        }

        $user->update($data);

        // If charity_id is provided and user is a charity staff, we could link them,
        // but our current schema has Charity pointing to User, not User pointing to Charity.
        // So we'd need to update the Charity record.
        if ($request->has('charity_id') && $data['role_id'] == 11) {
            $charity = Charity::find($request->charity_id);
            if ($charity) {
                $charity->update(['user_id' => $user->id]);
            }
        }

        return response()->json(['status'=>'success','user'=>$user]);
    }

    // deletes user
    public function deleteUser($id)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['status'=>'error','message'=>'User not found'],404);
        
        $user->delete();
        return response()->json(['status'=>'success','message'=>'User deleted successfully']);
    }
}
