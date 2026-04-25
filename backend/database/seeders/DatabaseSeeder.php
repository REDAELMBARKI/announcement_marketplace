<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;
use App\Models\DomainUser;
use App\Models\Donor;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run the announcement seeder first
        $this->call([
            FilterAttributeSeeder::class,
            AnnouncementSeeder::class,
            HeroSliderSeeder::class,
            BannerSeeder::class,
        ]);
        
        // Keep default user just in case
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);
    }
}

