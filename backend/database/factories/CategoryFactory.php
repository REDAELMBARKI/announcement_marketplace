<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            'Clothing' => ['icon' => 'shirt', 'children' => ['Boys', 'Girls', 'Unisex', 'Newborn']],
            'Toys & Games' => ['icon' => 'gamepad', 'children' => ['Educational', 'Outdoor', 'Indoor']],
            'Furniture' => ['icon' => 'couch', 'children' => ['Cribs', 'Chairs', 'Tables', 'Storage']],
            'Books & Media' => ['icon' => 'book', 'children' => ['Storybooks', 'Educational', 'Activity Books']],
            'Sports & Play' => ['icon' => 'ball', 'children' => ['Bikes', 'Sports Equipment', 'Outdoor Play']],
        ];

        $categoryName = fake()->randomElement(array_keys($categories));
        $isParent = fake()->boolean(70); // 70% chance of being a parent category

        if ($isParent) {
            return [
                'parent_id' => null,
                'name' => $categoryName,
                'name_ar' => fake()->word(),
                'name_fr' => fake()->word(),
                'slug' => strtolower(str_replace(' ', '-', $categoryName)) . '-' . uniqid(),
                'icon' => $categories[$categoryName]['icon'],
                'sort_order' => fake()->numberBetween(1, 100),
                'is_active' => true,
            ];
        } else {
            $parentCategory = Category::whereNull('parent_id')->inRandomOrder()->first();
            if (!$parentCategory) {
                // If no parent exists, create one first
                $parentName = fake()->randomElement(array_keys($categories));
                $parentCategory = Category::factory()->parent()->create([
                    'name' => $parentName,
                    'slug' => strtolower(str_replace(' ', '-', $parentName)) . '-' . uniqid(),
                    'icon' => $categories[$parentName]['icon'],
                ]);
            }
            $childCategories = $categories[$parentCategory->name]['children'] ?? ['General'];
            $childName = fake()->randomElement($childCategories);

            return [
                'parent_id' => $parentCategory->id,
                'name' => $childName,
                'name_ar' => fake()->word(),
                'name_fr' => fake()->word(),
                'slug' => strtolower(str_replace(' ', '-', $childName)) . '-' . uniqid(),
                'icon' => null,
                'sort_order' => fake()->numberBetween(1, 100),
                'is_active' => true,
            ];
        }
    }

    /**
     * Create a parent category
     */
    public function parent(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => null,
        ]);
    }

    /**
     * Create a child category
     */
    public function child(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => Category::whereNull('parent_id')->inRandomOrder()->first()->id,
        ]);
    }
}
