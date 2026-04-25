<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing roles
        DB::table('roles')->delete();

        $roles = [
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Administrator with full access to the system',
            ],
            [
                'name' => 'User',
                'slug' => 'user',
                'description' => 'Regular user with standard permissions',
            ],
            [
                'name' => 'Moderator',
                'slug' => 'moderator',
                'description' => 'Moderator with content management permissions',
            ],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}
