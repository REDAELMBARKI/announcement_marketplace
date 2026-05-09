<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Offer;
use App\Models\User;
use Illuminate\Database\Seeder;

class OfferSeeder extends Seeder
{
    /**
     * Seed offers for products.
     */
    public function run(): void
    {

        $products = Product::all();
        
        if ($products->isEmpty()) {
            $this->command->warn('No products found. Please seed products first.');
            return;
        }

        $users = User::all();
        
        if ($users->count() < 2) {
            $this->command->warn('Need at least 2 users for seeding. Please seed users first.');
            return;
        }

        $offerCount = 0;

        foreach ($products as $product) {
            // Seed 0-3 offers per product
            $offerCountPerProduct = fake()->numberBetween(0, 3);
            
            for ($i = 0; $i < $offerCountPerProduct; $i++) {
                // Get a random user who is NOT the product owner
                $buyer = $users->where('id', '!=', $product->user_id)->random();
                
                // Check if this buyer already has a pending offer on this product
                $existingOffer = Offer::where('product_id', $product->id)
                    ->where('buyer_id', $buyer->id)
                    ->where('status', 'pending')
                    ->first();
                
                if (!$existingOffer) {
                    $offerPrice = round($product->price * fake()->randomFloat(2, 0.6, 0.95), 2);
                    $status = fake()->randomElement(['pending', 'pending', 'accepted', 'rejected', 'countered']);
                    
                    $offerData = [
                        'product_id' => $product->id,
                        'buyer_id' => $buyer->id,
                        'seller_id' => $product->user_id,
                        'original_price' => $product->price,
                        'offer_price' => $offerPrice,
                        'status' => $status,
                    ];

                    // Add counter price for countered offers
                    if ($status === 'countered') {
                        $offerData['counter_price'] = round($product->price * fake()->randomFloat(2, 0.85, 0.98), 2);
                        $offerData['responded_at'] = fake()->dateTimeBetween('-5 days', 'now');
                    }

                    // Add response time for accepted/rejected
                    if (in_array($status, ['accepted', 'rejected'])) {
                        $offerData['responded_at'] = fake()->dateTimeBetween('-5 days', 'now');
                    }

                    Offer::factory()->create($offerData);
                    $offerCount++;
                }
            }
        }

    }
}
