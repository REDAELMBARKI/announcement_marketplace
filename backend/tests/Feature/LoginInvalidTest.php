<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class LoginInvalidTest extends TestCase
{
    /** @test */
    public function user_cannot_login_with_wrong_password()
    {
        $user = User::firstOrCreate(
            ['email' => 'test-login-invalid@example.com'],
            [
                'name'     => 'Wrong Password User',
                'password' => Hash::make('correct-password'),
                'role_ID'  => 10,
            ]
        );

        $response = $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }
}
