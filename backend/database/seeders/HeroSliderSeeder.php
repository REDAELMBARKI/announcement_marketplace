<?php

namespace Database\Seeders;

use App\Models\HeroSlider;
use App\Models\Media;
use Illuminate\Database\Seeder;

class HeroSliderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing hero sliders and their media
        HeroSlider::all()->each(function ($slider) {
            $slider->thumbnail()->delete();
            $slider->delete();
        });

        $slides = [
            [
                'image_url' => 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=2000',
                'headline' => 'Pre-loved Treasures for Little Ones',
                'subline' => "Quality kids' gear that grows with them. Buy, sell, or donate today.",
                'cta1_text' => 'Shop Marketplace',
                'cta1_link' => '/marketplace',
                'cta2_text' => 'Donate Gear',
                'cta2_link' => '/donate',
                'sort_order' => 1,
            ],
            [
                'image_url' => 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=2000',
                'headline' => 'Join the Circular Kids Community',
                'subline' => 'Reduce waste and support local families by giving clothes a second life.',
                'cta1_text' => 'How it Works',
                'cta1_link' => '/how-it-works',
                'cta2_text' => 'Sign Up',
                'cta2_link' => '/sign_up',
                'sort_order' => 2,
            ],
            [
                'image_url' => 'https://images.unsplash.com/photo-1522771935876-2497116a7a9e?auto=format&fit=crop&q=80&w=2000',
                'headline' => 'Summer Adventures Await',
                'subline' => 'Find everything they need for the perfect outdoor summer.',
                'cta1_text' => 'Summer Shop',
                'cta1_link' => '/category/summer',
                'cta2_text' => 'Browse All',
                'cta2_link' => '/marketplace',
                'sort_order' => 3,
            ]
        ];

        foreach ($slides as $slideData) {
            $imageUrl = $slideData['image_url'];
            unset($slideData['image_url']);
            
            $slider = HeroSlider::create($slideData);
            
            $slider->thumbnail()->create([
                'url' => $imageUrl,
                'path' => $imageUrl,
                'collection' => 'thumbnail',
                'disk' => 'public',
                'file_name' => basename($imageUrl),
                'mime_type' => 'image/jpeg',
                'size' => 0,
            ]);
        }
    }
}
