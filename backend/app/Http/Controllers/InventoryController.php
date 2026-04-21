<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;

// this controller is for managing inventory
class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Inventory::with('charity');

        // charity wants only their inventory
        if ($request->filled('charity_ID')) {
            $query->where('charity_ID', $request->charity_ID);
        }

        return response()->json([
            'status'    => 'success',
            'inventory' => $query->get()
        ]);
    }

    //get a specific inventory item
    public function show($id)
    {
        $item = Inventory::with('charity')->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'item'   => $item
        ]);
    }
    public function distribute($id)
    {
        $item = Inventory::findOrFail($id);
        $item->distributed = true;
        $item->save();
    
        return response()->json([
            'status' => 'success',
            'message' => 'Item distributed successfully'
        ]);
    }
    

    
}
