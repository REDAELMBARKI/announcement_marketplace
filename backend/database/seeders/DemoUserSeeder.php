<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        $demoUser = User::updateOrCreate(
            ['email' => 'demo@example.com'],
            [
                'name' => 'Demo User',
                'slug' => 'demo-user',
                'password' => Hash::make('password123'),
                'role_id' => 10,
            ]
        );

        Product::factory()->count(5)->create([
            'user_id' => $demoUser->id,
            'listing_mode' => 'sell',
            'status' => 'sell',
        ]);

        Product::factory()->count(5)->create([
            'user_id' => $demoUser->id,
            'listing_mode' => 'donate',
            'status' => 'donate',
        ]);

        Product::factory()->count(3)->create([
            'user_id' => $demoUser->id,
            'listing_mode' => 'sell',
            'status' => 'sold',
        ]);

        Product::factory()->count(4)->create([
            'user_id' => $demoUser->id,
            'listing_mode' => 'donate',
            'status' => 'donated',
        ]);
    }
}
