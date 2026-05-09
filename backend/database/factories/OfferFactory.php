<?php

namespace Database\Factories;

use App\Models\Offer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Offer>
 */
class OfferFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $product = Product::inRandomOrder()->first();
        $originalPrice = $product?->price ?? fake()->randomFloat(2, 10, 500);
        $offerPrice = $originalPrice * fake()->randomFloat(2, 0.6, 0.95); // 60-95% of original price
        
        $offerMessages = [
            'Would you accept this price? I can pick up today.',
            'Student here, would appreciate a small discount!',
            'Is this price negotiable?',
            'I can pay cash immediately.',
            'Would you take this if I collect this weekend?',
            'Final offer, can pick up anytime.',
            'Could you do this price for a quick sale?',
            'Interested! Is this your best price?',
        ];

        $status = fake()->randomElement(['pending', 'accepted', 'rejected', 'countered', 'expired']);
        
        $counterPrice = null;
        if ($status === 'countered') {
            $counterPrice = $originalPrice * fake()->randomFloat(2, 0.85, 0.98); // Counter at 85-98%
        }

        return [
            'product_id' => $product?->id ?? 1,
            'buyer_id' => User::inRandomOrder()->first()->id,
            'seller_id' => $product?->user_id ?? User::inRandomOrder()->first()->id,
            'original_price' => $originalPrice,
            'offer_price' => round($offerPrice, 2),
            'status' => $status,
            'message' => fake()->randomElement($offerMessages),
            'counter_price' => $counterPrice ? round($counterPrice, 2) : null,
            'expires_at' => $status === 'pending' ? now()->addDays(fake()->numberBetween(1, 7)) : null,
            'responded_at' => in_array($status, ['accepted', 'rejected', 'countered']) ? fake()->dateTimeBetween('-5 days', 'now') : null,
            'created_at' => fake()->dateTimeBetween('-3 weeks', 'now'),
            'updated_at' => now(),
        ];
    }

    /**
     * Create a pending offer.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'counter_price' => null,
            'responded_at' => null,
            'expires_at' => now()->addDays(7),
        ]);
    }

    /**
     * Create an accepted offer.
     */
    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'accepted',
            'counter_price' => null,
            'responded_at' => fake()->dateTimeBetween('-5 days', 'now'),
        ]);
    }

    /**
     * Create a rejected offer.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'counter_price' => null,
            'responded_at' => fake()->dateTimeBetween('-5 days', 'now'),
        ]);
    }

    /**
     * Create a countered offer.
     */
    public function countered(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'countered',
            'responded_at' => fake()->dateTimeBetween('-5 days', 'now'),
        ]);
    }
}
