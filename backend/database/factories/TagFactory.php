<?php

namespace Database\Factories;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tag>
 */
class TagFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tags = [
            'winter', 'summer', 'spring', 'autumn',
            'nike', 'adidas', 'gap', 'hm', 'zara',
            'bundle', 'lot', 'set', 'collection',
            'new', 'used', 'vintage', 'retro',
            'educational', 'learning', 'developmental',
            'outdoor', 'indoor', 'travel', 'play',
            'organic', 'eco-friendly', 'sustainable',
            'premium', 'designer', 'luxury',
            'comfortable', 'soft', 'durable',
            'school', 'preschool', 'daycare',
            'party', 'formal', 'casual', 'sleepwear',
        ];

        $tagName = fake()->unique()->randomElement($tags);

        return [
            'name' => $tagName,
            'slug' => strtolower(str_replace(' ', '-', $tagName)) . '-' . uniqid(),
        ];
    }
}
