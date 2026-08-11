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
                ['id' => 1, 'label' => '0-1 ans', 'value' => '0-1 ans'],
                ['id' => 2, 'label' => '1-3 ans', 'value' => '1-3 ans'],
                ['id' => 3, 'label' => '3-6 ans', 'value' => '3-6 ans'],
                ['id' => 4, 'label' => '6-10 ans', 'value' => '6-10 ans'],
                ['id' => 5, 'label' => '10-14 ans', 'value' => '10-14 ans'],
            ],
            'clothingSizes' => [
                ['id' => 1, 'label' => 'Prématuré', 'value' => 'prema'],
                ['id' => 2, 'label' => 'Naissance', 'value' => 'naissance'],
                ['id' => 3, 'label' => '1 mois', 'value' => '1m'],
                ['id' => 4, 'label' => '3 mois', 'value' => '3m'],
                ['id' => 5, 'label' => '6 mois', 'value' => '6m'],
                ['id' => 6, 'label' => '9 mois', 'value' => '9m'],
                ['id' => 7, 'label' => '12 mois', 'value' => '12m'],
                ['id' => 8, 'label' => '18 mois', 'value' => '18m'],
                ['id' => 9, 'label' => '24 mois', 'value' => '24m'],
                ['id' => 10, 'label' => '3 ans', 'value' => '3y'],
                ['id' => 11, 'label' => '4 ans', 'value' => '4y'],
                ['id' => 12, 'label' => '5 ans', 'value' => '5y'],
                ['id' => 13, 'label' => '6 ans', 'value' => '6y'],
                ['id' => 14, 'label' => '8 ans', 'value' => '8y'],
                ['id' => 15, 'label' => '10 ans', 'value' => '10y'],
                ['id' => 16, 'label' => '12 ans', 'value' => '12y'],
                ['id' => 17, 'label' => '14 ans', 'value' => '14y'],
            ],
            'shoeSizes' => [
                ['id' => 1, 'label' => '16', 'value' => '16'],
                ['id' => 2, 'label' => '17', 'value' => '17'],
                ['id' => 3, 'label' => '18', 'value' => '18'],
                ['id' => 4, 'label' => '19', 'value' => '19'],
                ['id' => 5, 'label' => '20', 'value' => '20'],
                ['id' => 6, 'label' => '21', 'value' => '21'],
                ['id' => 7, 'label' => '22', 'value' => '22'],
                ['id' => 8, 'label' => '23', 'value' => '23'],
                ['id' => 9, 'label' => '24', 'value' => '24'],
                ['id' => 10, 'label' => '25', 'value' => '25'],
                ['id' => 11, 'label' => '26', 'value' => '26'],
                ['id' => 12, 'label' => '27', 'value' => '27'],
                ['id' => 13, 'label' => '28', 'value' => '28'],
                ['id' => 14, 'label' => '29', 'value' => '29'],
                ['id' => 15, 'label' => '30', 'value' => '30'],
                ['id' => 16, 'label' => '31', 'value' => '31'],
                ['id' => 17, 'label' => '32', 'value' => '32'],
                ['id' => 18, 'label' => '33', 'value' => '33'],
                ['id' => 19, 'label' => '34', 'value' => '34'],
                ['id' => 20, 'label' => '35', 'value' => '35'],
            ],
            'conditions' => [
                ['id' => 1, 'label' => 'Neuf avec étiquette', 'value' => 'Neuf avec étiquette', 'color' => '#00b894'],
                ['id' => 2, 'label' => 'Neuf sans étiquette', 'value' => 'Neuf sans étiquette', 'color' => '#55efc4'],
                ['id' => 3, 'label' => 'Très bon état', 'value' => 'Très bon état', 'color' => '#0984e3'],
                ['id' => 4, 'label' => 'Bon état', 'value' => 'Bon état', 'color' => '#fdcb6e'],
                ['id' => 5, 'label' => 'Satisfaisant', 'value' => 'Satisfaisant', 'color' => '#e17055'],
            ],
            'listingTypes' => [
                ['id' => 1, 'label' => 'À vendre', 'icon' => '🛒', 'value' => 'sell'],
                ['id' => 2, 'label' => 'À donner', 'icon' => '🎁', 'value' => 'donate'],
            ],
            'cities' => [
                ['id' => 1, 'label' => 'Casablanca', 'value' => '1'],
                ['id' => 2, 'label' => 'Rabat', 'value' => '2'],
                ['id' => 3, 'label' => 'Marrakech', 'value' => '3'],
                ['id' => 4, 'label' => 'Agadir', 'value' => '4'],
                ['id' => 5, 'label' => 'Tanger', 'value' => '5'],
                ['id' => 6, 'label' => 'Fès', 'value' => '6'],
                ['id' => 7, 'label' => 'Meknès', 'value' => '7'],
                ['id' => 8, 'label' => 'Oujda', 'value' => '8'],
                ['id' => 9, 'label' => 'Kénitra', 'value' => '9'],
                ['id' => 10, 'label' => 'Tétouan', 'value' => '10'],
            ],
            'materials' => [
                ['id' => 1, 'label' => 'Coton', 'value' => 'coton'],
                ['id' => 2, 'label' => 'Laine', 'value' => 'laine'],
                ['id' => 3, 'label' => 'Polyester', 'value' => 'polyester'],
                ['id' => 4, 'label' => 'Soie', 'value' => 'soie'],
                ['id' => 5, 'label' => 'Lin', 'value' => 'lin'],
                ['id' => 6, 'label' => 'Velours', 'value' => 'velours'],
                ['id' => 7, 'label' => 'Jean', 'value' => 'jean'],
                ['id' => 8, 'label' => 'Cuir', 'value' => 'cuir'],
            ],
            'colors' => [
                ['id' => 1, 'label' => 'Noir', 'value' => 'Noir', 'hex' => '#000000'],
                ['id' => 2, 'label' => 'Blanc', 'value' => 'Blanc', 'hex' => '#FFFFFF'],
                ['id' => 3, 'label' => 'Gris', 'value' => 'Gris', 'hex' => '#808080'],
                ['id' => 4, 'label' => 'Rouge', 'value' => 'Rouge', 'hex' => '#FF0000'],
                ['id' => 5, 'label' => 'Bleu', 'value' => 'Bleu', 'hex' => '#0000FF'],
                ['id' => 6, 'label' => 'Vert', 'value' => 'Vert', 'hex' => '#008000'],
                ['id' => 7, 'label' => 'Jaune', 'value' => 'Jaune', 'hex' => '#FFFF00'],
                ['id' => 8, 'label' => 'Rose', 'value' => 'Rose', 'hex' => '#FFC0CB'],
                ['id' => 9, 'label' => 'Violet', 'value' => 'Violet', 'hex' => '#800080'],
                ['id' => 10, 'label' => 'Orange', 'value' => 'Orange', 'hex' => '#FFA500'],
                ['id' => 11, 'label' => 'Marron', 'value' => 'Marron', 'hex' => '#A52A2A'],
                ['id' => 12, 'label' => 'Beige', 'value' => 'Beige', 'hex' => '#F5F5DC'],
                ['id' => 13, 'label' => 'Marine', 'value' => 'Marine', 'hex' => '#000080'],
                ['id' => 14, 'label' => 'Ciel', 'value' => 'Ciel', 'hex' => '#87CEEB'],
                ['id' => 15, 'label' => 'Doré', 'value' => 'Doré', 'hex' => '#FFD700'],
                ['id' => 16, 'label' => 'Argenté', 'value' => 'Argenté', 'hex' => '#C0C0C0'],
                ['id' => 17, 'label' => 'Multicolore', 'value' => 'Multicolore', 'hex' => 'linear-gradient(45deg, red, blue, green, yellow)'],
            ],
            'genders' => [
                ['id' => 1, 'label' => 'Fille', 'value' => 'girl'],
                ['id' => 2, 'label' => 'Garçon', 'value' => 'boy'],
                ['id' => 3, 'label' => 'Mixte', 'value' => 'both'],
            ],
            'sortOptions' => [
                ['id' => 1, 'label' => 'Plus récents', 'value' => 'newest'],
                ['id' => 2, 'label' => 'Prix croissant', 'value' => 'price_asc'],
                ['id' => 3, 'label' => 'Prix décroissant', 'value' => 'price_desc'],
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
