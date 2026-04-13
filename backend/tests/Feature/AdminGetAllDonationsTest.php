<?php

namespace Tests\Feature;

use Tests\TestCase;

class AdminGetAllDonationsTest extends TestCase
{
    /** @test */
    public function admin_can_get_all_donations()
    {
        $response = $this->getJson('/api/admin/donations');

        $response->assertStatus(200);
    }
}
