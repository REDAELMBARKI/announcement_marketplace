<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Donation;
use Carbon\Carbon;

class UpdateDonationStatusTest extends TestCase
{
    /** @test */
    public function can_update_donation_status_to_approved()
    {
        $donation = Donation::create([
            'donor_ID'        => 15,                
            'charity_ID'      => 25,
            'donation_status' => 'Pending',
            'donation_date'   => Carbon::now(),
            'pickup_address'  => 'Test address',
        ]);

        $response = $this->postJson("/api/donations/{$donation->donation_ID}/status", [
            'status' => 'Approved',
        ]);

        $response->assertStatus(200);
    }
}
