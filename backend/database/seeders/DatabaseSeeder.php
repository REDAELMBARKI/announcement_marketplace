<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run the announcement seeder first

        $this->call(AnnouncementSeeder::class);

        // Seed one admin and one donor in unified users table.
        User::updateOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Main Admin',
                'password' => Hash::make('Admin@12345'),
                'role_id' => 12,
            ]
        );

        User::updateOrCreate(
            ['email' => 'donor@test.com'],
            [
                'name' => 'Default Donor',
                'password' => Hash::make('Donor@12345'),
                'role_id' => 10,
            ]
        );

    }
}

