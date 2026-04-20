<?php

namespace Database\Factories;

use App\Models\Media;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Media>
 */
class MediaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Fake image URLs from placeholder services
        $imageUrls = [
            'https://picsum.photos/seed/kidsclothes1/400/300.jpg',
            'https://picsum.photos/seed/kidsclothes2/400/300.jpg',
            'https://picsum.photos/seed/kidsclothes3/400/300.jpg',
            'https://picsum.photos/seed/kidsclothes4/400/300.jpg',
            'https://picsum.photos/seed/kidsclothes5/400/300.jpg',
            'https://picsum.photos/seed/kidsclothes6/400/300.jpg',
            'https://picsum.photos/seed/kidsclothes7/400/300.jpg',
            'https://picsum.photos/seed/kidsclothes8/400/300.jpg',
            'https://picsum.photos/seed/kidsclothes9/400/300.jpg',
            'https://picsum.photos/seed/kidsclothes10/400/300.jpg',
            'https://picsum.photos/seed/toys1/400/300.jpg',
            'https://picsum.photos/seed/toys2/400/300.jpg',
            'https://picsum.photos/seed/toys3/400/300.jpg',
            'https://picsum.photos/seed/toys4/400/300.jpg',
            'https://picsum.photos/seed/toys5/400/300.jpg',
            'https://picsum.photos/seed/books1/400/300.jpg',
            'https://picsum.photos/seed/books2/400/300.jpg',
            'https://picsum.photos/seed/books3/400/300.jpg',
            'https://picsum.photos/seed/games1/400/300.jpg',
            'https://picsum.photos/seed/games2/400/300.jpg',
        ];

        $collections = ['thumbnail', 'gallery'];
        $collection = fake()->randomElement($collections);
        
        return [
            'mediable_id' => null, // Will be set when creating media for specific model
            'mediable_type' => null, // Will be set when creating media for specific model
            'disk' => 'public',
            'path' => 'images/' . fake()->uuid() . '.jpg',
            'url' => fake()->randomElement($imageUrls),
            'file_name' => fake()->uuid() . '.jpg',
            'mime_type' => 'image/jpeg',
            'size' => fake()->numberBetween(50000, 500000), // 50KB - 500KB
            'collection' => $collection,
            'sort_order' => $collection === 'thumbnail' ? 0 : fake()->numberBetween(1, 10),
        ];
    }

    /**
     * Create media for a product
     */
    public function forProduct($productId): static
    {
        return $this->state(fn (array $attributes) => [
            'mediable_id' => $productId,
            'mediable_type' => 'App\\Models\\Product',
        ]);
    }

    /**
     * Create media for a user (avatar)
     */
    public function forUser($userId): static
    {
        return $this->state(fn (array $attributes) => [
            'mediable_id' => $userId,
            'mediable_type' => 'App\\Models\\User',
            'collection' => 'avatar',
        ]);
    }

    /**
     * Create a thumbnail
     */
    public function thumbnail(): static
    {
        return $this->state(fn (array $attributes) => [
            'collection' => 'thumbnail',
            'sort_order' => 0,
        ]);
    }

    /**
     * Create gallery images
     */
    public function gallery(): static
    {
        return $this->state(fn (array $attributes) => [
            'collection' => 'gallery',
            'sort_order' => fake()->numberBetween(1, 10),
        ]);
    }
}
