<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class LoginValidTest extends TestCase
{
    /** @test */
    public function user_can_login_with_valid_credentials()
    {
        // Create or reuse a user
        $user = User::firstOrCreate(
            ['email' => 'test-login@example.com'],
            [
                'name'     => 'Test Login User',
                'password' => Hash::make('password123'),
                'role_ID'  => 10,
            ]
        );

        $response = $this->postJson('/api/login', [
            'email'    => 'user1@test.com',
            'password' => '123456',
        ]);

        $response->assertStatus(200);
    }
}
