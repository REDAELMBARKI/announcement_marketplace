<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Conversation;
use App\Models\Media;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Seeds products, media, and conversations for the primary demo user so
 * /api/dashboard/* (My Impact) returns non-zero, realistic data.
 */
class UserImpactDemoSeeder extends Seeder
{
    public const DEMO_EMAIL = 'soufiane@gmail.com';

    public function run(): void
    {
        $donor = User::query()->where('email', self::DEMO_EMAIL)->first();
        if (! $donor) {
            $this->command?->warn('User '.self::DEMO_EMAIL.' not found. Skipping UserImpactDemoSeeder (run DatabaseSeeder first).');

            return;
        }

        DB::transaction(function () use ($donor) {
            $this->removePriorDemoProducts($donor->id);

            $catClothes = Category::query()->firstOrCreate(
                ['slug' => 'impact-demo-clothes'],
                [
                    'name' => 'Kids Clothes & wear',
                    'name_ar' => null,
                    'name_fr' => null,
                    'icon' => 'shirt',
                    'sort_order' => 900,
                    'is_active' => true,
                    'parent_id' => null,
                ]
            );

            $catShoes = Category::query()->firstOrCreate(
                ['slug' => 'impact-demo-shoes'],
                [
                    'name' => 'School shoes & sneakers',
                    'name_ar' => null,
                    'name_fr' => null,
                    'icon' => 'footprints',
                    'sort_order' => 901,
                    'is_active' => true,
                    'parent_id' => null,
                ]
            );

            $catAcc = Category::query()->firstOrCreate(
                ['slug' => 'impact-demo-accessories'],
                [
                    'name' => 'Bags & kid accessories',
                    'name_ar' => null,
                    'name_fr' => null,
                    'icon' => 'palette',
                    'sort_order' => 902,
                    'is_active' => true,
                    'parent_id' => null,
                ]
            );

            $catGeneral = Category::query()->firstOrCreate(
                ['slug' => 'impact-demo-general'],
                [
                    'name' => 'Household, electronics & more',
                    'name_ar' => null,
                    'name_fr' => null,
                    'icon' => 'box',
                    'sort_order' => 903,
                    'is_active' => true,
                    'parent_id' => null,
                ]
            );

            $buyers = $this->ensureImpactBuyers();

            $now = Carbon::now();

            $rows = [
                // Donations — status mix (pending / scheduled / completed)
                [
                    'title' => 'Impact Demo — Winter coat bundle',
                    'listing_mode' => 'donate',
                    'status' => 'donate',
                    'super' => $catClothes,
                    'views' => 210,
                    'days_ago' => 4,
                ],
                [
                    'title' => 'Impact Demo — School shirts (3)',
                    'listing_mode' => 'donate',
                    'status' => 'reserved',
                    'super' => $catClothes,
                    'views' => 95,
                    'days_ago' => 7,
                ],
                [
                    'title' => 'Impact Demo — Pyjama set (donated)',
                    'listing_mode' => 'donate',
                    'status' => 'donated',
                    'super' => $catClothes,
                    'views' => 132,
                    'days_ago' => 12,
                ],
                [
                    'title' => 'Impact Demo — Toy basket',
                    'listing_mode' => 'donate',
                    'status' => 'closed',
                    'super' => $catAcc,
                    'views' => 64,
                    'days_ago' => 18,
                ],
                // Sales — available / reserved / sold
                [
                    'title' => 'Impact Demo — Trainers (top views)',
                    'listing_mode' => 'sell',
                    'status' => 'sell',
                    'super' => $catShoes,
                    'views' => 512,
                    'days_ago' => 1,
                ],
                [
                    'title' => 'Impact Demo — Party dress',
                    'listing_mode' => 'sell',
                    'status' => 'reserved',
                    'super' => $catClothes,
                    'views' => 340,
                    'days_ago' => 2,
                ],
                [
                    'title' => 'Impact Demo — Sandals (sold)',
                    'listing_mode' => 'sell',
                    'status' => 'sold',
                    'super' => $catShoes,
                    'views' => 198,
                    'days_ago' => 5,
                ],
                [
                    'title' => 'Impact Demo — Rain jacket (closed)',
                    'listing_mode' => 'sell',
                    'status' => 'closed',
                    'super' => $catClothes,
                    'views' => 120,
                    'days_ago' => 9,
                ],
                // Extra volume for activity chart (same 30d window)
                [
                    'title' => 'Impact Demo — Leggings pack',
                    'listing_mode' => 'donate',
                    'status' => 'donate',
                    'super' => $catClothes,
                    'views' => 45,
                    'days_ago' => 0,
                ],
                [
                    'title' => 'Impact Demo — Hat & scarf set',
                    'listing_mode' => 'sell',
                    'status' => 'sell',
                    'super' => $catAcc,
                    'views' => 22,
                    'days_ago' => 3,
                ],
                [
                    'title' => 'Impact Demo — Sports shorts',
                    'listing_mode' => 'donate',
                    'status' => 'donate',
                    'super' => $catClothes,
                    'views' => 30,
                    'days_ago' => 6,
                ],
                [
                    'title' => 'Impact Demo — Baby shoes',
                    'listing_mode' => 'donate',
                    'status' => 'reserved',
                    'super' => $catShoes,
                    'views' => 55,
                    'days_ago' => 11,
                ],
                [
                    'title' => 'Impact Demo — Bluetooth speaker (sell)',
                    'listing_mode' => 'sell',
                    'status' => 'sell',
                    'super' => $catGeneral,
                    'views' => 88,
                    'days_ago' => 14,
                ],
                [
                    'title' => 'Impact Demo — Moving boxes bundle (donate)',
                    'listing_mode' => 'donate',
                    'status' => 'donate',
                    'super' => $catGeneral,
                    'views' => 41,
                    'days_ago' => 16,
                ],
                [
                    'title' => 'Impact Demo — Desk lamp (sell)',
                    'listing_mode' => 'sell',
                    'status' => 'sell',
                    'super' => $catGeneral,
                    'views' => 76,
                    'days_ago' => 19,
                ],
                [
                    'title' => 'Impact Demo — Board games (donate)',
                    'listing_mode' => 'donate',
                    'status' => 'donated',
                    'super' => $catGeneral,
                    'views' => 102,
                    'days_ago' => 22,
                ],
            ];

            foreach ($rows as $idx => $row) {
                $created = $now->copy()->subDays($row['days_ago'])->setTime(10, 30, 0);
                $phoneSuffix = str_pad((string) (($idx % 90) + 10), 2, '0', STR_PAD_LEFT);
                $product = Product::query()->create([
                    'user_id' => $donor->id,
                    'super_category_id' => $row['super']->id,
                    'listing_mode' => $row['listing_mode'],
                    'listing_type' => 'single',
                    'title' => $row['title'],
                    'description' => 'Seeded for My Impact dashboard verification.',
                    'price' => $row['listing_mode'] === 'sell' ? 9.99 : 0,
                    'currency' => 'GBP',
                    'price_negotiable' => false,
                    'pickup_address' => '10 Demo Street, UK',
                    'contact_phone' => '+447700900'.$phoneSuffix,
                    'handover_method' => 'pickup',
                    'status' => $row['status'],
                    'condition' => 'good',
                    'gender' => 'unisex',
                    'age_range' => '3-5y',
                    'brand' => 'DemoBrand',
                    'season' => 'winter',
                    'sizes' => ['M', 'L'],
                    'colors' => ['navy', 'red'],
                    'views_count' => $row['views'],
                    'favorites_count' => 0,
                    'created_at' => $created,
                    'updated_at' => $created,
                ]);

                Media::query()->create([
                    'mediable_id' => $product->id,
                    'mediable_type' => Product::class,
                    'disk' => 'public',
                    'path' => 'external/'.Str::slug($row['title']).'.jpg',
                    'url' => 'https://picsum.photos/seed/'.Str::slug($row['title']).'/400/300.jpg',
                    'file_name' => 'thumb.jpg',
                    'mime_type' => 'image/jpeg',
                    'size' => 0,
                    'collection' => 'thumbnail',
                    'sort_order' => 0,
                    'is_temporary' => false,
                ]);
            }

            // Contact clicks: conversations where seller = donor
            $productsForClicks = Product::query()
                ->where('user_id', $donor->id)
                ->orderByDesc('views_count')
                ->limit(4)
                ->pluck('id');

            $buyerList = $buyers->all();
            $b = 0;
            foreach ($productsForClicks as $pid) {
                for ($k = 0; $k < 2; $k++) {
                    if (! isset($buyerList[$b])) {
                        break 2;
                    }
                    $buyer = $buyerList[$b];
                    $b++;
                    Conversation::query()->firstOrCreate(
                        [
                            'product_id' => $pid,
                            'buyer_id' => $buyer->id,
                        ],
                        [
                            'seller_id' => $donor->id,
                            'last_message_at' => $now,
                        ]
                    );
                }
            }
        });

        $this->command?->info('UserImpactDemoSeeder: My Impact data ready for '.self::DEMO_EMAIL.' (password: Soufiane123@)');
    }

    private function removePriorDemoProducts(int $userId): void
    {
        $query = Product::query()->where('user_id', $userId)->where('title', 'like', 'Impact Demo —%');
        $ids = $query->pluck('id');
        if ($ids->isEmpty()) {
            return;
        }

        Media::query()
            ->where('mediable_type', Product::class)
            ->whereIn('mediable_id', $ids)
            ->delete();

        // Hard delete so counts stay correct (soft delete would still count in some queries)
        Product::query()->whereIn('id', $ids)->forceDelete();
    }

    /**
     * @return \Illuminate\Support\Collection<int, User>
     */
    private function ensureImpactBuyers()
    {
        $emails = [
            'impact-buyer-1@test.com',
            'impact-buyer-2@test.com',
            'impact-buyer-3@test.com',
            'impact-buyer-4@test.com',
            'impact-buyer-5@test.com',
            'impact-buyer-6@test.com',
            'impact-buyer-7@test.com',
            'impact-buyer-8@test.com',
        ];

        $out = collect();
        foreach ($emails as $email) {
            $out->push(
                User::query()->firstOrCreate(
                    ['email' => $email],
                    [
                        'name' => 'Impact Buyer',
                        'password' => Hash::make('password'),
                        'role_id' => 10,
                    ]
                )
            );
        }

        return $out;
    }
}
