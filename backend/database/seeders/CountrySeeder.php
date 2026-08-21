<?php

namespace Database\Seeders;

use App\Models\Country;
use Illuminate\Database\Seeder;

class CountrySeeder extends Seeder
{
    /**
     * Run the database seeds with ISO codes.
     */
    public function run(): void
    {
        $countries = [
            ['name' => 'Maroc', 'code' => 'MA', 'dial_code' => '+212', 'flag' => '🇲🇦'],
            ['name' => 'France', 'code' => 'FR', 'dial_code' => '+33', 'flag' => '🇫🇷'],
            ['name' => 'États-Unis', 'code' => 'US', 'dial_code' => '+1', 'flag' => '🇺🇸'],
            ['name' => 'Espagne', 'code' => 'ES', 'dial_code' => '+34', 'flag' => '🇪🇸'],
            ['name' => 'Canada', 'code' => 'CA', 'dial_code' => '+1', 'flag' => '🇨🇦'],
            ['name' => 'Royaume-Uni', 'code' => 'GB', 'dial_code' => '+44', 'flag' => '🇬🇧'],
            ['name' => 'Allemagne', 'code' => 'DE', 'dial_code' => '+49', 'flag' => '🇩🇪'],
            ['name' => 'Émirats Arabes Unis', 'code' => 'AE', 'dial_code' => '+971', 'flag' => '🇦🇪'],
            ['name' => 'Arabie Saoudite', 'code' => 'SA', 'dial_code' => '+966', 'flag' => '🇸🇦'],
            ['name' => 'Algérie', 'code' => 'DZ', 'dial_code' => '+213', 'flag' => '🇩🇿'],
            ['name' => 'Tunisie', 'code' => 'TN', 'dial_code' => '+216', 'flag' => '🇹🇳'],
            ['name' => 'Italie', 'code' => 'IT', 'dial_code' => '+39', 'flag' => '🇮🇹'],
            ['name' => 'Belgique', 'code' => 'BE', 'dial_code' => '+32', 'flag' => '🇧🇪'],
            ['name' => 'Pays-Bas', 'code' => 'NL', 'dial_code' => '+31', 'flag' => '🇳🇱'],
            ['name' => 'Suisse', 'code' => 'CH', 'dial_code' => '+41', 'flag' => '🇨🇭'],
            ['name' => 'Portugal', 'code' => 'PT', 'dial_code' => '+351', 'flag' => '🇵🇹'],
            ['name' => 'Turquie', 'code' => 'TR', 'dial_code' => '+90', 'flag' => '🇹🇷'],
            ['name' => 'Égypte', 'code' => 'EG', 'dial_code' => '+20', 'flag' => '🇪🇬'],
            ['name' => 'Sénégal', 'code' => 'SN', 'dial_code' => '+221', 'flag' => '🇸🇳'],
            ['name' => 'Côte d\'Ivoire', 'code' => 'CI', 'dial_code' => '+225', 'flag' => '🇨🇮'],
        ];

        foreach ($countries as $countryData) {
            Country::updateOrCreate(
                ['code' => $countryData['code']],
                $countryData
            );
        }
    }
}
