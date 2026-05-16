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
        $roles = [
            1 => [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Administrator with full access to the system',
            ],
            2 => [
                'name' => 'User',
                'slug' => 'user',
                'description' => 'Regular user with standard permissions',
            ],
            3 => [
                'name' => 'Moderator',
                'slug' => 'moderator',
                'description' => 'Moderator with content management permissions',
            ],
        ];

        foreach ($roles as $id => $data) {
            Role::updateOrCreate(
                ['id' => $id],
                $data
            );
        }
    }
}
