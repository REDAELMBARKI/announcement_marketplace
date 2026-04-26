<?php

namespace Database\Seeders;

use App\Models\Charity;
use Illuminate\Database\Seeder;

/**
 * Partner foundations / charities shown across the app.
 */
class FoundationSeeder extends Seeder
{
    public function run(): void
    {
        if (! \Illuminate\Support\Facades\Schema::hasTable('Charity')) {
            return;
        }

        $rows = [
            [
                'charity_name' => 'Community Care Foundation',
                'charity_address' => '12 Hope Street, London',
                'charity_email' => 'hello@communitycarefoundation.org.uk',
                'contact_person' => 'Alex Morgan',
                'charity_phone' => '+442079460001',
            ],
            [
                'charity_name' => 'UK Neighbours Aid',
                'charity_address' => '88 Market Road, Manchester',
                'charity_email' => 'support@ukneighboursaid.org',
                'contact_person' => 'Priya Shah',
                'charity_phone' => '+441615550002',
            ],
            [
                'charity_name' => 'Bright Futures Collective',
                'charity_address' => '3 Riverside Walk, Bristol',
                'charity_email' => 'team@brightfuturescollective.org',
                'contact_person' => "James O'Neill",
                'charity_phone' => '+441179460003',
            ],
            [
                'charity_name' => 'Circular Goods Network',
                'charity_address' => 'Unit 5, Exchange Quarter, Birmingham',
                'charity_email' => 'contact@circulargoods.network',
                'contact_person' => 'Samira El-Khoury',
                'charity_phone' => '+441214960004',
            ],
        ];

        foreach ($rows as $data) {
            Charity::query()->updateOrCreate(
                ['charity_email' => $data['charity_email']],
                $data
            );
        }
    }
}
