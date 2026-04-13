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
        // Keep default user just in case
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        // Insert roles
        Role::insert([
            ['role_name' => 'admin', 'role_description' => 'Administrator'],
            ['role_name' => 'donor', 'role_description' => 'Donor'],
            ['role_name' => 'charity_staff', 'role_description' => 'Charity Staff'],
        ]);

        $donorRole = Role::where('role_name', 'donor')->first();

        // Create a test user in DomainUser
        $domainUser = DomainUser::create([
            'user_name' => 'Test User',
            'user_email' => 'test@example.com',
            'user_password' => Hash::make('password'),
            'role_id' => $donorRole->role_ID,
        ]);

        Donor::create([
            'user_ID' => $domainUser->user_ID,
            'donor_address' => '123 Test Street'
        ]);
    }
}

