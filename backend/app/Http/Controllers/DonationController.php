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
            'listing_type'    => ['nullable', 'string', 'in:sale,donation'],
            'size'            => ['nullable', 'string', 'max:255'],
            'sizes'           => ['nullable'],
            'colors'          => ['nullable'],
            'gender'          => ['nullable', 'string', 'max:40'],
            'recommended_age' => ['nullable', 'string', 'max:40'],
            'brand'           => ['nullable', 'string', 'max:120'],
            'material'        => ['nullable', 'string', 'max:120'],
            'season'          => ['nullable', 'string', 'max:60'],
            'quantity'        => ['nullable', 'integer', 'min:1'],
            'condition'       => ['required', 'string'],
            'description'     => ['nullable', 'string'],
            'price'           => ['nullable', 'numeric', 'min:0'],
            'currency'        => ['nullable', 'string', 'max:10'],
            'negotiable'      => ['nullable', 'boolean'],
            'image'           => ['nullable', 'image', 'max:4096'],
            'photos'          => ['nullable', 'array', 'max:8'],
            'photos.*'        => ['image', 'max:4096'],
            'primary_photo_index' => ['nullable', 'integer', 'min:0', 'max:7'],
            'pickup_address'  => ['nullable', 'string', 'max:255'],
            'pickup_city'     => ['nullable', 'string', 'max:120'],
            'pickup_district' => ['nullable', 'string', 'max:120'],
            'handover_method' => ['nullable', 'string', 'max:60'],
        ]);

        //image upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('donation_images', 'public');
        }

        $galleryPaths = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $galleryPaths[] = $photo->store('donation_images', 'public');
            }
        }
        if (empty($galleryPaths) && $imagePath) {
            $galleryPaths[] = $imagePath;
        }

        //create donation
        $donation = Donation::create([
            'donor_ID'        => $validated['donor_ID'],
            'charity_ID'      => $validated['charity_ID'],
            'donation_status' => 'Pending',
            'donation_date'   => now(),
            'pickup_address'  => $validated['pickup_address'] ?? null,
            'pickup_city'     => $validated['pickup_city'] ?? null,
            'pickup_district' => $validated['pickup_district'] ?? null,
            'handover_method' => $validated['handover_method'] ?? null,
        ]);

        $sizes = $this->parseListField($request->input('sizes'));
        $colors = $this->parseListField($request->input('colors'));
        $resolvedSize = $validated['size'] ?? ($sizes[0] ?? null);
        $isDonationListing = ($validated['listing_type'] ?? 'donation') === 'donation';
        $price = $isDonationListing ? null : ($validated['price'] ?? null);

        //create donation item
        $item = DonationItem::create([
            'donation_ID'      => $donation->donation_ID,
            'item_name'        => $validated['item_name'],
            'listing_type'     => $validated['listing_type'] ?? 'donation',
            'item_price'       => $price,
            'item_currency'    => $validated['currency'] ?? 'MAD',
            'price_negotiable' => $validated['negotiable'] ?? false,
            'item_category'    => $validated['category'],
            'item_size'        => $resolvedSize,
            'item_condition'   => $validated['condition'],
            'item_gender'      => $validated['gender'] ?? null,
            'recommended_age'  => $validated['recommended_age'] ?? null,
            'item_brand'       => $validated['brand'] ?? null,
            'item_material'    => $validated['material'] ?? null,
            'item_season'      => $validated['season'] ?? null,
            'item_quantity'    => $validated['quantity'] ?? 1,
            'item_sizes'       => !empty($sizes) ? json_encode($sizes) : null,
            'item_colors'      => !empty($colors) ? json_encode($colors) : null,
            'item_gallery'     => !empty($galleryPaths) ? json_encode($galleryPaths) : null,
            'primary_photo_index' => $validated['primary_photo_index'] ?? 0,
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

    private function parseListField($value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map('trim', $value), fn ($entry) => $entry !== ''));
        }

        if (is_string($value) && $value !== '') {
            return array_values(array_filter(array_map('trim', explode(',', $value)), fn ($entry) => $entry !== ''));
        }

        return [];
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
