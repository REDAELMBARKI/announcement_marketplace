<?php

namespace Tests\Feature;

use Tests\TestCase;

class GetCharitiesTest extends TestCase
{
    /** @test */
    public function get_all_charities_returns_ok()
    {
        $response = $this->getJson('/api/charities');

        $response->assertStatus(200);
    }
}
