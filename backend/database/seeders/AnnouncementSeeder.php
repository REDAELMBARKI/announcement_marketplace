<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use App\Models\Tag;
use App\Models\User;
use App\Models\Review;
use App\Models\Address;
use App\Models\Favorite;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Exception;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks temporarily (database-agnostic)
        Schema::disableForeignKeyConstraints();

        // Clear existing data
        $this->clearExistingData();

        // Create data in proper order
        $this->createUsers();
        $this->createCategories();
        $this->createProducts();
        $this->createReviews();
        $this->createFavorites();

        // Re-enable foreign key checks
        Schema::enableForeignKeyConstraints();

        $this->command->info('Announcement data seeded successfully!');
    }

    private function clearExistingData(): void
    {
        DB::table('favorites')->delete();
        DB::table('reviews')->delete();
        DB::table('addresses')->delete();
        DB::table('media')->delete();
        DB::table('product_tag')->delete();
        DB::table('subcategory_product')->delete();
        DB::table('products')->delete();
        DB::table('tags')->delete();
        DB::table('categories')->delete();
        DB::table('users')->delete();
    }

    private function createUsers(): void
    {
        // Create 5 specific Moroccan users
        $users = [
            ['name' => 'Fatima Alami', 'slug' => 'fatima-alami' ,  'email' => 'fatima@example.com', 'rating' => 4.8, 'role_id' => 10],
            ['name' => 'Youssef Benkiran' , 'slug' => 'youssef-benkiran' , 'email' => 'youssef@example.com', 'rating' => 4.5, 'role_id' => 10],
            ['name' => 'Amina Rachidi', 'slug' => 'amina-rachidi' ,  'email' => 'amina@example.com', 'rating' => 4.9, 'role_id' => 10],
            ['name' => 'Karim El Mardi', 'slug' => 'karim-el-mardi' ,  'email' => 'karim@example.com', 'rating' => 4.7, 'role_id' => 10],
            ['name' => 'Sofia Mansouri', 'slug' => 'sofia-mansouri' ,  'email' => 'sofia@example.com', 'rating' => 4.6, 'role_id' => 10],
        ];

        foreach ($users as $userData) {
            $user = User::factory()->create([
                'name' => $userData['name'],
                'slug' => $userData['slug'],
                'email' => $userData['email'],
                'rating' => $userData['rating'],
                'role_id' => $userData['role_id'],
            ]);

            Media::create([
                'mediable_id' => $user->id,
                'mediable_type' => User::class,
                'collection' => 'avatar',
                'disk' => 'public',
                'path' => 'avatars/' . $user->slug . '.jpg',
                'url' => 'https://i.pravatar.cc/150?u=' . $user->email,
                'file_name' => 'avatar.jpg',
            ]);
        }
    }

    private function createCategories(): void
    {
        // Create 6 top-level categories matching the frontend Add_Announcement.tsx
        $superCategories = [
            [
                'name' => 'Vêtements', 'slug' => 'vetements', 'icon' => 'shirt',
                'image' => 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?auto=format&fit=crop&q=80&w=800',
                'subcategories' => [
                    ['name' => 'Hauts & T-shirts', 'slug' => 'hauts-t-shirts'],
                    ['name' => 'Pantalons & Jeans', 'slug' => 'pantalons-jeans'],
                    ['name' => 'Robes & Jupes', 'slug' => 'robes-jupes'],
                    ['name' => 'Pulls & Cardigans', 'slug' => 'pulls-cardigans'],
                    ['name' => 'Manteaux & Vestes', 'slug' => 'manteaux-vestes'],
                    ['name' => 'Ensembles', 'slug' => 'ensembles'],
                    ['name' => 'Pyjamas & Maillots', 'slug' => 'pyjamas-maillots'],
                    ['name' => 'Sous-vêtements', 'slug' => 'sous-vetements'],
                    ['name' => 'Accessoires', 'slug' => 'accessoires'],
                ]
            ],
            [
                'name' => 'Chaussures', 'slug' => 'chaussures', 'icon' => 'footprints',
                'image' => 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800',
                'subcategories' => [
                    ['name' => 'Baskets & Sneakers', 'slug' => 'baskets-sneakers'],
                    ['name' => 'Bottes & Bottines', 'slug' => 'bottes-bottines'],
                    ['name' => 'Sandales & Tongs', 'slug' => 'sandales-tongs'],
                    ['name' => 'Chaussures de ville', 'slug' => 'chaussures-ville'],
                    ['name' => 'Chaussons', 'slug' => 'chaussons'],
                ]
            ],
            [
                'name' => 'Jouets', 'slug' => 'jouets', 'icon' => 'gamepad-2',
                'image' => 'https://images.unsplash.com/photo-1531346727404-cc74a445f02c?auto=format&fit=crop&q=80&w=800',
                'subcategories' => [
                    ['name' => 'Éveil & Premier âge', 'slug' => 'eveil-premier-age'],
                    ['name' => 'Jeux de société', 'slug' => 'jeux-societe'],
                    ['name' => 'Poupées & Figurines', 'slug' => 'poupees-figurines'],
                    ['name' => 'Véhicules & Circuits', 'slug' => 'vehicules-circuits'],
                    ['name' => 'Jeux de construction', 'slug' => 'jeux-construction'],
                    ['name' => 'Jeux d\'imitation', 'slug' => 'jeux-imitation'],
                    ['name' => 'Peluches', 'slug' => 'peluches'],
                    ['name' => 'Plein air', 'slug' => 'plein-air'],
                ]
            ],
            [
                'name' => 'Puériculture', 'slug' => 'puericulture', 'icon' => 'baby',
                'image' => 'https://images.unsplash.com/photo-1522771935876-2497116a7a9e?auto=format&fit=crop&q=80&w=800',
                'subcategories' => [
                    ['name' => 'Sommeil', 'slug' => 'sommeil'],
                    ['name' => 'Repas', 'slug' => 'repas'],
                    ['name' => 'Bain & Soins', 'slug' => 'bain-soins'],
                    ['name' => 'Sécurité', 'slug' => 'securite'],
                    ['name' => 'Poussettes & Sièges auto', 'slug' => 'poussettes-sieges-auto'],
                    ['name' => 'Portage', 'slug' => 'portage'],
                ]
            ],
            [
                'name' => 'Livres & Éveil', 'slug' => 'livres-eveil', 'icon' => 'book',
                'image' => 'https://images.unsplash.com/photo-1491843351663-8511e81d312a?auto=format&fit=crop&q=80&w=800',
                'subcategories' => [
                    ['name' => 'Albums illustrés', 'slug' => 'albums-illustres'],
                    ['name' => 'Contes & Histoires', 'slug' => 'contes-histoires'],
                    ['name' => 'Livres sonores', 'slug' => 'livres-sonores'],
                    ['name' => 'Livres à toucher', 'slug' => 'livres-toucher'],
                    ['name' => 'Activités & Coloriages', 'slug' => 'activites-coloriages'],
                ]
            ],
            [
                'name' => 'Autre', 'slug' => 'autre', 'icon' => 'package',
                'image' => 'https://images.unsplash.com/photo-1533091902244-f9a912da2a5e?auto=format&fit=crop&q=80&w=800',
                'subcategories' => [
                    ['name' => 'Mobilier', 'slug' => 'mobilier'],
                    ['name' => 'Décoration', 'slug' => 'decoration'],
                    ['name' => 'Matériel de sport', 'slug' => 'materiel-sport'],
                    ['name' => 'Divers', 'slug' => 'divers'],
                ]
            ],
        ];

        foreach ($superCategories as $super) {
            $parent = Category::create([
                'name' => $super['name'],
                'slug' => $super['slug'],
                'icon' => $super['icon'],
                'is_active' => true,
            ]);

            Media::create([
                'mediable_id' => $parent->id,
                'mediable_type' => Category::class,
                'collection' => 'category',
                'disk' => 'public',
                'path' => 'categories/' . $parent->slug . '.jpg',
                'url' => $super['image'],
                'file_name' => 'category.jpg',
            ]);

            foreach ($super['subcategories'] as $sub) {
                Category::create([
                    'name' => $sub['name'],
                    'slug' => $sub['slug'],
                    'parent_id' => $parent->id,
                    'is_active' => true,
                ]);
            }
        }
    }

    private function createProducts(): void
    {
        $users = User::all();
        $categories = Category::whereNotNull('parent_id')->get();

        $productNames = [
            'Vélo Enfant Sécurisé', 'Costume Traditionnel Maroc', 'Puzzle Géographie Maroc',
            'Sac à Dos École Maroc', 'Jouet Bois Artisanal', 'Robe Enfant Soie',
            'Livre Histoire Maroc', 'Meuble Chambre Enfant', 'Jeu Construction Maroc',
            'Chaussures Sport Enfant', 'Activité Peinture Maroc', 'Jouet Peluche Animaux',
            'Vêtement Sport Enfant', 'Livre Coloriage Maroc'
        ];

        // Create 20 products distributed across categories
        foreach ($productNames as $index => $productName) {
            $category = $categories[$index % $categories->count()];
            $user = $users[$index % $users->count()];
            $parentCategory = Category::find($category->parent_id);

            $mode = fake()->randomElement(['sell', 'donate']);
            $product = Product::factory()->create([
                'title' => $productName,
                'slug' => Str::slug($productName),
                'description' => 'Produit de qualité pour enfants au Maroc. ' . fake()->sentence(),
                'price' => fake()->randomFloat(2, 50, 500),
                'listing_mode' => $mode,
                'status' => 'published',
                'user_id' => $user->id,
                'super_category_id' => $parentCategory->id,
                'views_count' => fake()->numberBetween(10, 1000),
                'favorites_count' => fake()->numberBetween(0, 50),
                'condition' => fake()->randomElement(['Neuf', 'Très bon état', 'Bon état']),
                'age_range' => fake()->randomElement(['0-2 ans', '2-5 ans', '5-8 ans', '8-12 ans']),
                'contact_phone' => '06' . fake()->numerify('########'),
            ]);

            // Link to category (sub-category)
            $product->categories()->attach($category->id);

            // Create Moroccan address
            $randomCity = \App\Models\City::inRandomOrder()->first();
            $product->address()->create([
                'city_id' => $randomCity->id,
                'district' => fake()->word(),
                'address_line' => fake()->streetAddress(),
            ]);

            // Create thumbnail
            Media::factory()->create([
                'mediable_id' => $product->id,
                'mediable_type' => Product::class,
                'collection' => 'thumbnail',
                'url' => 'https://picsum.photos/seed/' . Str::slug($productName) . '/400/300.jpg',
            ]);

             Media::factory()->create([
                'mediable_id' => $product->id,
                'mediable_type' => Product::class,
                'collection' => 'gallery',
                'url' => 'https://picsum.photos/seed/' . Str::slug($productName . "1") . '/400/300.jpg',
            ]);

             Media::factory()->create([
                'mediable_id' => $product->id,
                'mediable_type' => Product::class,
                'collection' => 'gallery',
                'url' => 'https://picsum.photos/seed/' . Str::slug($productName . "2")  . '/400/300.jpg',
            ]);

        }
    }

    private function createReviews(): void
    {
        $products = Product::all();
        $users = User::all();

        $reviewComments = [
            'Excellent produit, mon enfant adore!', 'Très bonne qualité, je recommande',
            'Produit conforme à la description', 'Superbe, livraison rapide',
            'Qualité professionnelle', 'Parfait pour les enfants', 'Très satisfait',
            'Bon rapport qualité/prix', 'Produit artisanal magnifique'
        ];

        $usedPairs = [];
        
        foreach ($products as $product) {
            // Create 3-6 reviews per product
            $reviewCount = fake()->numberBetween(3, 6);
            for ($i = 0; $i < $reviewCount; $i++) {
                $user = $users->random();
                $pairKey = $user->id . '-' . $product->id;
                
                // Ensure unique reviewer-product pair
                if (!in_array($pairKey, $usedPairs)) {
                    $usedPairs[] = $pairKey;
                    Review::factory()->create([
                        'product_id' => $product->id,
                        'reviewer_id' => $user->id,
                        'reviewed_id' => $product->user_id,
                        'rating' => fake()->numberBetween(4, 5), // Mostly positive reviews
                        'comment' => $reviewComments[array_rand($reviewComments)],
                    ]);
                }
            }
        }
    }

    private function createFavorites(): void
    {
        $products = Product::all();
        $users = User::all();

        foreach ($products as $product) {
            // Randomly select 0-3 users to favorite this product
            $favoritedBy = $users->random(fake()->numberBetween(0, 3));
            foreach ($favoritedBy as $user) {
                Favorite::create([
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                ]);
            }
        }
    }
}
