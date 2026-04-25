<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Media;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing banners and their media
        Banner::all()->each(function ($banner) {
            $banner->thumbnail()->delete();
            $banner->delete();
        });

        $banners = [
            [
                'type' => 'split',
                'title' => 'How TinyTrove Works',
                'subtitle' => 'Every item sold extends its life and supports children in need.',
                'image_url' => 'https://images.unsplash.com/photo-1513159419869-623ae1b1a620?auto=format&fit=crop&q=80&w=800',
                'badge_text' => 'Circular Kids',
                'cta_text' => 'Learn more about our mission',
                'cta_link' => '/how-it-works',
                'steps' => [
                    [
                        'num' => '01',
                        'title' => 'Gather Gear',
                        'description' => 'Find gently used outfits and toys your kids have outgrown.'
                    ],
                    [
                        'num' => '02',
                        'title' => 'Choose Your Path',
                        'description' => 'Sell them for cash or donate them instantly to a verified cause.'
                    ],
                    [
                        'num' => '03',
                        'title' => 'Make an Impact',
                        'description' => 'Every item sold extends its life and supports children in need.'
                    ]
                ],
                'sort_order' => 1,
            ],
            [
                'type' => 'simple',
                'title' => 'Donate Clothes',
                'subtitle' => 'Give your children\'s outgrown clothes a second life and help families in need.',
                'image_url' => 'https://images.unsplash.com/photo-1532622722611-b3345861abbd?auto=format&fit=crop&q=80&w=1200',
                'badge_text' => 'Impact',
                'cta_text' => 'Start Donating',
                'cta_link' => '/donate',
                'sort_order' => 2,
            ],
            [
                'type' => 'simple',
                'title' => 'Sell Your Items',
                'subtitle' => 'Turn your gently used kids\' gear into cash while helping other parents find quality items.',
                'image_url' => 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200',
                'badge_text' => 'Resell',
                'cta_text' => 'List an Item',
                'cta_link' => '/sell',
                'sort_order' => 3,
            ],
            [
                'type' => 'simple',
                'title' => 'Safety & Quality First',
                'subtitle' => 'Our community depends on trust. Every item listed is reviewed to ensure it meets our quality standards.',
                'image_url' => 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=1200',
                'badge_text' => 'Trusted',
                'cta_text' => 'Our Quality Promise',
                'cta_link' => '/quality-standards',
                'sort_order' => 4,
            ]
        ];

        foreach ($banners as $bannerData) {
            $imageUrl = $bannerData['image_url'];
            unset($bannerData['image_url']);
            
            $banner = Banner::create($bannerData);
            
            if ($imageUrl) {
                $banner->thumbnail()->create([
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
}
