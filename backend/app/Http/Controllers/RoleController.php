<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;

// this controller is for managing roles
class RoleController extends Controller
{
    //get all roles
    public function index()
    {
        $roles = Role::all();
        return response()->json($roles);
    }
    //get a specific role by ID
    public function show($id)
    {
        $role = Role::with('users')->findOrFail($id);
        return response()->json($role);
    }
}