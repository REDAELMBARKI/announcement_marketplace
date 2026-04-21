<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class ViewUserController extends Controller
{
    // this gets all users
    public function getViewUsers()
    {
        $users = User::all();
        return response()->json(['status'=>'success','users'=>$users]);
    }

    // gets all roles - return empty since no Role model exists
    public function getRoles()
    {
        $roles = [];
        return response()->json(['status'=>'success','roles'=>$roles]);
    }

    // gets list of charities - return empty since no Charity model exists
    public function getCharitiesList()
    {
        $charities = [];
        return response()->json(['status'=>'success','charities'=>$charities]);
    }

    // updates user
    public function updateUser(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['status'=>'error','message'=>'User not found'],404);

        // Simplified update since no Role model exists
        $user->update($request->all());

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
