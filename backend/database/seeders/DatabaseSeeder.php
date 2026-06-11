<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run seeders in order
        $this->call([
            HeroSliderSeeder::class,
            BannerSeeder::class,
            FilterAttributeSeeder::class,
            AnnouncementSeeder::class,
            ReviewSeeder::class,
            OfferSeeder::class,
        ]);
        
        // Create admin user
        User::factory()->create([
            'name' => 'Admin User',
            'slug' => 'admin-user',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role_id' => 12, // Admin role
        ]);
        
        // Create regular user
        User::factory()->create([
            'name' => 'Test User',
            'slug' => 'test-user',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'role_id' => 10, // donor role
        ]);
    }
}
