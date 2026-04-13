<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\DonationItem;
use App\Models\Inventory;
use Illuminate\Http\Request;
 
// Controller for managing donations
class DonationController extends Controller
{
    //get donations for a specific donor
    public function getUserDonations($donorId)
    {
        $donations = Donation::with(['items', 'charity'])
            ->where('donor_ID', $donorId)
            ->orderByDesc('donation_date')
            ->get();

        return response()->json([
            'status' => 'success',
            'donations' => $donations,
        ]);
    }

    //create donation and item (inventory isnt updated here)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'donor_ID'        => ['required', 'integer'],
            'charity_ID'      => ['required', 'integer', 'exists:Charity,charity_ID'],
            'item_name'       => ['required', 'string', 'max:255'],
            'category'        => ['required', 'string', 'max:255'],
            'size'            => ['required', 'string', 'max:10'],
            'condition'       => ['required', 'string'],
            'description'     => ['nullable', 'string'],
            'image'           => ['nullable', 'image', 'max:4096'],
            'pickup_address'  => ['nullable', 'string', 'max:255'],
        ]);

        //image upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('donation_images', 'public');
        }

        //create donation
        $donation = Donation::create([
            'donor_ID'        => $validated['donor_ID'],
            'charity_ID'      => $validated['charity_ID'],
            'donation_status' => 'Pending',
            'donation_date'   => now(),
            'pickup_address'  => $validated['pickup_address'] ?? null,
        ]);

        //create donation item
        $item = DonationItem::create([
            'donation_ID'      => $donation->donation_ID,
            'item_name'        => $validated['item_name'],
            'item_category'    => $validated['category'],
            'item_size'        => $validated['size'],
            'item_condition'   => $validated['condition'],
            'item_description' => $validated['description'] ?? null,
            'item_image'       => $imagePath,
        ]);

        //return response
        return response()->json([
            'status'   => 'success',
            'message'  => 'Donation submitted successfully!',
            'donation' => $donation,
            'item'     => $item,
        ], 201);
    }

     //Get all donations for a charity
    public function getCharityDonations($charityId)
    {
        $donations = Donation::with(['items', 'donor.user'])
            ->where('charity_ID', $charityId)
            ->orderByDesc('donation_date')
            ->get();

        return response()->json([
            'status'    => 'success',
            'donations' => $donations,
        ]);
    }

    
     //Update donation status (Approved / Declined / Pending)
     //inventory only, updates when approved
    public function updateStatus(Request $request, $donationId)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:Pending,Approved,Declined'],
        ]);

        $donation = Donation::with('items')->findOrFail($donationId);

        $donation->donation_status = $validated['status'];
        $donation->save();

        //add to inventory, only when approved
        if ($validated['status'] === 'Approved') {

            foreach ($donation->items as $item) {
                Inventory::firstOrCreate(
                    [
                        'charity_ID' => $donation->charity_ID,
                        'item'       => $item->item_name,
                        'category'   => $item->item_category,
                        'size'       => $item->item_size,
                    ],
                    [ 'quantity' => 1 ]
                )->increment('quantity');
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => "Donation status updated to {$validated['status']}.",
        ]);
    }

    
     //Admin gets all donations to view
     public function getAllDonations()
     {
         $donations = Donation::with(['items', 'charity', 'donor'])->orderByDesc('donation_date')->get();
     
         //add distributed info for each item
         $donations = $donations->map(function ($donation) {
             $donation->items = $donation->items->map(function ($item) use ($donation) {
                 // find corresponding inventory record
                 $inventoryItem = Inventory::where('charity_ID', $donation->charity_ID)
                     ->where('item', $item->item_name)
                     ->where('category', $item->item_category)
                     ->where('size', $item->item_size)
                     ->first();
     
                 $item->distributed = $inventoryItem ? (bool)$inventoryItem->distributed : false;
     
                 return $item;
             });
     
             return $donation;
         });
     
         return response()->json([
             'status' => 'success',
             'donations' => $donations,
         ]);
     }
     
}
