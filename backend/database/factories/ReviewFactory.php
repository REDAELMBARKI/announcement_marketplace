<?php

namespace Database\Factories;

use App\Models\Review;
use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $reviewComments = [
            'Great quality product, exactly as described!',
            'Fast shipping and excellent condition.',
            'My child loves this item. Highly recommend!',
            'Good value for money. Would buy again.',
            'Perfect for my little one. Thank you!',
            'Excellent communication with seller.',
            'Item was even better than expected.',
            'Quick delivery and well packaged.',
            'Great seller, very helpful and responsive.',
            'Amazing quality, worth every penny!',
            'Exactly what I was looking for.',
            'Good condition, clean and ready to use.',
            'Very happy with this purchase.',
            'Seller was very accommodating.',
            'Item arrived quickly and in great shape.',
        ];

        return [
            'reviewer_id' => User::inRandomOrder()->first()->id,
            'reviewed_id' => User::inRandomOrder()->first()->id,
            'product_id' => Product::inRandomOrder()->first()->id,
            'rating' => fake()->numberBetween(3, 5), // Bias towards positive reviews
            'comment' => fake()->randomElement($reviewComments),
            'created_at' => fake()->dateTimeBetween('-2 months', 'now'),
            'updated_at' => now(),
        ];
    }

    /**
     * Create a positive review (4-5 stars)
     */
    public function positive(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => fake()->numberBetween(4, 5),
        ]);
    }

    /**
     * Create a neutral review (3 stars)
     */
    public function neutral(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => 3,
        ]);
    }

    /**
     * Create a negative review (1-2 stars)
     */
    public function negative(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => fake()->numberBetween(1, 2),
        ]);
    }
}
