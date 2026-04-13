<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ViewUserController extends Controller
{
    // this gets all users
    public function getViewUsers()
    {
        $users = DB::table('User')
            ->leftJoin('Role','User.role_id','=','Role.role_id')
            ->leftJoin('Charity_Staff','User.user_ID','=','Charity_Staff.user_ID')
            ->leftJoin('Charity','Charity_Staff.charity_ID','=','Charity.charity_ID')
            ->select('User.user_ID','User.user_name','User.user_email','Role.role_name',
                     'Charity_Staff.charity_ID','Charity.charity_name')
            ->get();

        return response()->json(['status'=>'success','users'=>$users]);
    }

    // gets all roles
    public function getRoles()
    {
        $roles = DB::table('Role')->select('role_id','role_name')->get();
        return response()->json(['status'=>'success','roles'=>$roles]);
    }

    // gets list of charities
    public function getCharitiesList()
    {
        $charities = DB::table('Charity')
            ->select('charity_ID','charity_name')
            ->orderBy('charity_name','asc')
            ->get();
        return response()->json(['status'=>'success','charities'=>$charities]);
    }

    // updates user
    public function updateUser(Request $request, $id)
    {
        $user = DB::table('User')->where('user_ID',$id)->first();
        if (!$user) return response()->json(['status'=>'error','message'=>'User not found'],404);

        $roleName = DB::table('Role')->where('role_id',$user->role_id)->value('role_name');

        // only charity_staff can change charity assignment
        if ($roleName === 'charity_staff' && $request->has('charity_id')) {
            DB::table('Charity_Staff')->updateOrInsert(
                ['user_ID'=>$id],
                ['charity_ID'=>$request->charity_id]
            );
        }

        // only charity_staff can be promoted to admin
        if ($roleName === 'charity_staff' && $request->role_name === 'admin') {
            $adminRole = DB::table('Role')->where('role_name','admin')->first();
            DB::table('User')->where('user_ID',$id)->update(['role_id'=>$adminRole->role_id]);
            DB::table('Charity_Staff')->where('user_ID',$id)->delete();
        }

        $updatedUser = DB::table('User')
            ->leftJoin('Role','User.role_id','=','Role.role_id')
            ->leftJoin('Charity_Staff','User.user_ID','=','Charity_Staff.user_ID')
            ->leftJoin('Charity','Charity_Staff.charity_ID','=','Charity.charity_ID')
            ->select('User.user_ID','User.user_name','User.user_email','Role.role_name',
                     'Charity_Staff.charity_ID','Charity.charity_name')
            ->where('User.user_ID',$id)
            ->first();

        return response()->json(['status'=>'success','user'=>$updatedUser]);
    }

    // deletes user
    public function deleteUser($id)
    {
        DB::table('Charity_Staff')->where('user_ID',$id)->delete();
        DB::table('User')->where('user_ID',$id)->delete();
        return response()->json(['status'=>'success','message'=>'User deleted successfully']);
    }
}
