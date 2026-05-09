<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Seed reviews for products.
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

        $reviewCount = 0;

        foreach ($products as $product) {
            // Seed 2-6 reviews per product
            $reviewCountPerProduct = fake()->numberBetween(2, 6);
            
            for ($i = 0; $i < $reviewCountPerProduct; $i++) {
                // Get a random user who is NOT the product owner
                $reviewer = $users->where('id', '!=', $product->user_id)->random();
                
                // Check if this user already reviewed this product
                $existingReview = Review::where('product_id', $product->id)
                    ->where('reviewer_id', $reviewer->id)
                    ->first();
                
                if (!$existingReview) {
                    Review::factory()->create([
                        'product_id' => $product->id,
                        'reviewer_id' => $reviewer->id,
                        'rating' => fake()->numberBetween(3, 5),
                    ]);
                    $reviewCount++;
                }
            }
        }

    }
}
