<?php

namespace Database\Seeders;

use App\Models\FilterAttribute;
use Illuminate\Database\Seeder;

class FilterAttributeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $attributes = [
            'ageRanges' => [
                ['id' => 1, 'label' => '0-1 ansTest', 'value' => '0-1 ans'],
                ['id' => 2, 'label' => '1-3 ans', 'value' => '1-3 ans'],
                ['id' => 3, 'label' => '3-6 ans', 'value' => '3-6 ans'],
                ['id' => 4, 'label' => '6-10 ans', 'value' => '6-10 ans'],
                ['id' => 5, 'label' => '10-14 ans', 'value' => '10-14 ans'],
            ],
            'clothingSizes' => [
                ['id' => 1, 'label' => '3 mois', 'value' => '3m'],
                ['id' => 2, 'label' => '6 mois', 'value' => '6m'],
                ['id' => 3, 'label' => '1T', 'value' => '1t'],
                ['id' => 4, 'label' => '2T', 'value' => '2t'],
                ['id' => 5, 'label' => '4T', 'value' => '4t'],
            ],
            'shoeSizes' => [
                ['id' => 1, 'label' => '20 EU', 'value' => '20'],
                ['id' => 2, 'label' => '24 EU', 'value' => '24'],
                ['id' => 3, 'label' => '28 EU', 'value' => '28'],
                ['id' => 4, 'label' => '32 EU', 'value' => '32'],
            ],
            'conditions' => [
                ['id' => 1, 'label' => 'Neufx', 'value' => 'Neuf', 'color' => '#00b894'],
                ['id' => 2, 'label' => 'Très bon état', 'value' => 'Très bon état', 'color' => '#0984e3'],
                ['id' => 3, 'label' => 'Bon état', 'value' => 'Bon état', 'color' => '#fdcb6e'],
                ['id' => 4, 'label' => 'État correct', 'value' => 'État correct', 'color' => '#e17055'],
            ],
            'listingTypes' => [
                ['id' => 1, 'label' => 'À vendre', 'icon' => '🛒', 'value' => 'sell'],
                ['id' => 2, 'label' => 'À donner / Gratuit', 'icon' => '🎁', 'value' => 'donate'],
                ['id' => 3, 'label' => 'Échange', 'icon' => '🔄', 'value' => 'swap'],
            ],
            'cities' => [
                ['id' => 1, 'label' => 'Casablanca', 'districts' => [['id' => 101, 'label' => 'Maarif'], ['id' => 102, 'label' => 'Anfa']]],
                ['id' => 2, 'label' => 'Rabat', 'districts' => [['id' => 201, 'label' => 'Agdal'], ['id' => 202, 'label' => 'Hay Riad']]],
                ['id' => 3, 'label' => 'Marrakech', 'districts' => [['id' => 301, 'label' => 'Gueliz'], ['id' => 302, 'label' => 'Hivernage']]],
                ['id' => 4, 'label' => 'Agadir', 'districts' => [['id' => 401, 'label' => 'Cité Dakhla'], ['id' => 402, 'label' => 'Bensergao']]],
                ['id' => 5, 'label' => 'Tanger', 'districts' => [['id' => 501, 'label' => 'Malabata'], ['id' => 502, 'label' => 'Marshane']]],
            ],
        ];

        foreach ($attributes as $group => $data) {
            FilterAttribute::updateOrCreate(
                ['group' => $group],
                ['data' => $data]
            );
        }
    }
}
