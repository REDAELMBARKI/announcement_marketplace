<?php

namespace Tests\Feature;

use Tests\TestCase;

class GetUserDonationsTest extends TestCase
{
    /** @test */
    public function get_user_donations_returns_ok()
    {
        $donorId = 1;

        $response = $this->getJson("/api/donations/user/{$donorId}");

        $response->assertStatus(200);
    }
}
