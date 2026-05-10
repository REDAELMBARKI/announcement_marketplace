<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ConversationSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $products = Product::all();

        if ($users->count() < 2 || $products->isEmpty()) {
            return;
        }

        foreach ($products as $product) {
            // Get a random buyer who is not the seller
            $buyer = $users->where('id', '!=', $product->user_id)->random();

            $conversation = Conversation::create([
                'slug' => Str::random(20),
                'product_id' => $product->id,
                'last_message_at' => now(),
            ]);

            $conversation->participants()->attach([
                $buyer->id => ['role' => 'buyer'],
                $product->user_id => ['role' => 'seller'],
            ]);
        }
    }
}
