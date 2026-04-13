<?php

namespace Tests\Feature;

use Tests\TestCase;

class CharityDonationsTest extends TestCase
{
    /** @test */
    public function can_get_donations_for_specific_charity()
    {
        $charityId = 25;

        $response = $this->getJson("/api/charity/{$charityId}/donations");

        $response->assertStatus(200);
    }
}
