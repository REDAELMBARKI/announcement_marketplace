<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $listingModes = ['sell', 'donate'];
        $listingTypes = ['single', 'collection'];
        $statuses = ['sell', 'donate', 'reserved', 'sold', 'donated'];
        $conditions = ['new', 'like_new', 'good', 'fair'];
        $genders = ['boy', 'girl', 'unisex'];
        $ageRanges = ['0-3m', '3-6m', '6-12m', '1-2y', '2-3y', '3-5y', '5-7y', '7-10y', '10-12y'];
        $brands = ['Nike', 'Adidas', 'H&M', 'Zara', 'GAP', 'Carter\'s', 'Mothercare', 'Next', 'Primark'];
        $seasons = ['spring', 'summer', 'autumn', 'winter'];
        $handoverMethods = ['pickup', 'delivery', 'both'];

        $listingMode = fake()->randomElement($listingModes);
        $price = $listingMode === 'sell' ? fake()->randomFloat(2, 5, 150) : null;

        return [
            'user_id' => User::inRandomOrder()->first()->id,
            'listing_mode' => $listingMode,
            'listing_type' => fake()->randomElement($listingTypes),
            'title' => fake()->words(3, true) . ' - ' . fake()->randomElement(['Kids', 'Children', 'Baby', 'Toddler']),
            'description' => fake()->sentences(3, true),
            'price' => $price,
            'currency' => 'MAD',
            'price_negotiable' => fake()->boolean(30),
            'pickup_address' => fake()->address(),
            'handover_method' => fake()->randomElement($handoverMethods),
            'status' => fake()->randomElement($statuses),
            'condition' => fake()->randomElement($conditions),
            'gender' => fake()->randomElement($genders),
            'age_range' => fake()->randomElement($ageRanges),
            'brand' => fake()->randomElement($brands),
            'season' => fake()->randomElement($seasons),
            'sizes' => fake()->randomElements(['XS', 'S', 'M', 'L', 'XL', '2T', '3T', '4T'], rand(1, 3)),
            'colors' => fake()->randomElements(['red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'black', 'white'], rand(1, 3)),
            'views_count' => fake()->numberBetween(0, 1000),
            'favorites_count' => fake()->numberBetween(0, 50),
            'created_at' => fake()->dateTimeBetween('-3 months', 'now'),
            'updated_at' => now(),
        ];
    }

    /**
     * Create a sell listing
     */
    public function sell(): static
    {
        return $this->state(fn (array $attributes) => [
            'listing_mode' => 'sell',
            'price' => fake()->randomFloat(2, 5, 150),
        ]);
    }

    /**
     * Create a donate listing
     */
    public function donate(): static
    {
        return $this->state(fn (array $attributes) => [
            'listing_mode' => 'donate',
            'price' => null,
        ]);
    }

    /**
     * Create an active listing
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => $attributes['listing_mode'] === 'donate' ? 'donate' : 'sell',
        ]);
    }

    /**
     * Create a popular listing (with high views)
     */
    public function popular(): static
    {
        return $this->state(fn (array $attributes) => [
            'views_count' => fake()->numberBetween(500, 2000),
            'favorites_count' => fake()->numberBetween(20, 100),
        ]);
    }

    /**
     * Create a recently listed product
     */
    public function recent(): static
    {
        return $this->state(fn (array $attributes) => [
            'created_at' => fake()->dateTimeBetween('-7 days', 'now'),
        ]);
    }
}
