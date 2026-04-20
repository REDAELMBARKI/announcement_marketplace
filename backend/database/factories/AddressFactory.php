<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Address>
 */
class AddressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $cities = [
            'Marrakech' => ['Guéliz', 'Ménara', 'Medina', 'Hivernage', 'Agdal'],
            'Casablanca' => ['Anfa', 'Maârif', 'Ain Sebaa', 'Sidi Maârouf', 'Hay Hassani'],
            'Rabat' => ['Agdal', 'Hassan', 'Yacoub Al-Mansour', 'Souissi', 'Ocean'],
            'Fès' => ['Nouveau', 'Medina', 'Agdal', 'Zouagha', 'Saïss'],
            'Tangier' => ['Medina', 'Malabata', 'Briech', 'Marchan', 'Mnar'],
        ];

        $city = fake()->randomElement(array_keys($cities));
        $district = fake()->randomElement($cities[$city]);

        return [
            'addressable_id' => Product::inRandomOrder()->first()->id,
            'addressable_type' => Product::class,
            'city' => $city,
            'district' => $district,
            'address_line' => fake()->streetAddress(),
            'lat' => fake()->latitude(31.0, 35.0), // Morocco latitude range
            'lng' => fake()->longitude(-10.0, -1.0), // Morocco longitude range
            'is_default' => false,
        ];
    }

    /**
     * Create an address for a user
     */
    public function forUser(): static
    {
        return $this->state(fn (array $attributes) => [
            'addressable_id' => User::inRandomOrder()->first()->id,
            'addressable_type' => User::class,
        ]);
    }

    /**
     * Create an address for a product
     */
    public function forProduct(): static
    {
        return $this->state(fn (array $attributes) => [
            'addressable_id' => Product::inRandomOrder()->first()->id,
            'addressable_type' => Product::class,
        ]);
    }
}
