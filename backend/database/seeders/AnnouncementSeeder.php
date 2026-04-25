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
use Illuminate\Support\Str;
use Exception;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks temporarily
        DB::statement('PRAGMA foreign_keys=OFF');

        // Clear existing data
        $this->clearExistingData();

        // Create data in proper order
        $this->createUsers();
        $this->createCategories();
        $this->createProducts();
        $this->createReviews();
        $this->createFavorites();

        // Verify no empty sections
        // $this->verifyDataIntegrity();

        // Re-enable foreign key checks
        DB::statement('PRAGMA foreign_keys=ON');

        $this->command->info('Announcement data seeded successfully!');
    }

    private function clearExistingData(): void
    {
        DB::table('favorites')->delete();
        DB::table('reviews')->delete();
        DB::table('addresses')->delete();
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
            ['name' => 'Fatima Alami', 'email' => 'fatima@example.com', 'rating' => 4.8, 'role_id' => 2],
            ['name' => 'Youssef Benkiran', 'email' => 'youssef@example.com', 'rating' => 4.5, 'role_id' => 2],
            ['name' => 'Amina Rachidi', 'email' => 'amina@example.com', 'rating' => 4.9, 'role_id' => 2],
            ['name' => 'Karim El Mardi', 'email' => 'karim@example.com', 'rating' => 4.7, 'role_id' => 2],
            ['name' => 'Sofia Mansouri', 'email' => 'sofia@example.com', 'rating' => 4.6, 'role_id' => 2],
        ];

        foreach ($users as $userData) {
            User::factory()->create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'rating' => $userData['rating'],
                'role_id' => $userData['role_id'],
            ]);
        }
    }

    private function createCategories(): void
    {
        // Create 8 top-level super categories with their sub-categories
        $superCategories = [
            [
                'name' => 'Jouets', 'slug' => 'jouets', 'icon' => 'gamepad-2',
                'subcategories' => [
                    ['name' => 'Jouets éducatifs', 'slug' => 'jouets-educatifs'],
                    ['name' => 'Peluches', 'slug' => 'peluches'],
                    ['name' => 'Jeux de construction', 'slug' => 'jeux-construction'],
                    ['name' => 'Figurines', 'slug' => 'figurines'],
                    ['name' => 'Véhicules', 'slug' => 'vehicules'],
                ]
            ],
            [
                'name' => 'Vêtements', 'slug' => 'vetements', 'icon' => 'shirt',
                'subcategories' => [
                    ['name' => 'T-shirts', 'slug' => 't-shirts'],
                    ['name' => 'Pantalons', 'slug' => 'pantalons'],
                    ['name' => 'Robes', 'slug' => 'robes'],
                    ['name' => 'Costumes traditionnels', 'slug' => 'costumes-traditionnels'],
                    ['name' => 'Pyjamas', 'slug' => 'pyjamas'],
                ]
            ],
            [
                'name' => 'Livres', 'slug' => 'livres', 'icon' => 'book-open',
                'subcategories' => [
                    ['name' => 'Contes marocains', 'slug' => 'contes-marocains'],
                    ['name' => 'Livres éducatifs', 'slug' => 'livres-educatifs'],
                    ['name' => 'Coloriages', 'slug' => 'coloriages'],
                    ['name' => 'Histoires', 'slug' => 'histoires'],
                ]
            ],
            [
                'name' => 'Mobilier', 'slug' => 'mobilier', 'icon' => 'home',
                'subcategories' => [
                    ['name' => 'Lits bébé', 'slug' => 'lits-bebe'],
                    ['name' => 'Chambres enfant', 'slug' => 'chambres-enfant'],
                    ['name' => 'Tables et chaises', 'slug' => 'tables-chaises'],
                    ['name' => 'Rangements', 'slug' => 'rangements'],
                ]
            ],
            [
                'name' => 'Bébé', 'slug' => 'bebe', 'icon' => 'baby',
                'subcategories' => [
                    ['name' => 'Poussettes', 'slug' => 'poussettes'],
                    ['name' => 'Porte-bébés', 'slug' => 'porte-bebes'],
                    ['name' => 'Allaitement', 'slug' => 'allaitement'],
                    ['name' => 'Doudous', 'slug' => 'doudous'],
                ]
            ],
            [
                'name' => 'Jeux', 'slug' => 'jeux', 'icon' => 'dice-5',
                'subcategories' => [
                    ['name' => 'Jeux de société', 'slug' => 'jeux-societe'],
                    ['name' => 'Jeux d\'extérieur', 'slug' => 'jeux-exterieur'],
                    ['name' => 'Puzzles', 'slug' => 'puzzles'],
                    ['name' => 'Jeux vidéo', 'slug' => 'jeux-video'],
                ]
            ],
            [
                'name' => 'Chaussures', 'slug' => 'chaussures', 'icon' => 'footprints',
                'subcategories' => [
                    ['name' => 'Chaussures sport', 'slug' => 'chaussures-sport'],
                    ['name' => 'Chaussures cuir', 'slug' => 'chaussures-cuir'],
                    ['name' => 'Sandales', 'slug' => 'sandales'],
                    ['name' => 'Bottes', 'slug' => 'bottes'],
                ]
            ],
            [
                'name' => 'Activités', 'slug' => 'activites', 'icon' => 'palette',
                'subcategories' => [
                    ['name' => 'Peinture', 'slug' => 'peinture'],
                    ['name' => 'Musique', 'slug' => 'musique'],
                    ['name' => 'Sport', 'slug' => 'sport'],
                    ['name' => 'Loisirs créatifs', 'slug' => 'loisirs-creatifs'],
                ]
            ],
        ];

        foreach ($superCategories as $index => $superCategory) {
            $parent = Category::factory()->create([
                'name' => $superCategory['name'],
                'slug' => $superCategory['slug'],
                'icon' => $superCategory['icon'],
                'is_active' => true,
                'sort_order' => $index + 1,
                'parent_id' => null,
            ]);

            // Create sub-categories for this super category
            foreach ($superCategory['subcategories'] as $subIndex => $subCategory) {
                Category::factory()->create([
                    'name' => $subCategory['name'],
                    'slug' => $subCategory['slug'],
                    'icon' => null,
                    'is_active' => true,
                    'sort_order' => $subIndex + 1,
                    'parent_id' => $parent->id,
                ]);
            }
        }
    }

    private function createProducts(): void
    {
        $categories = Category::all();
        $users = User::all();

        // Realistic Moroccan kids product names
        $productNames = [
            'Jouet Educatif Enfant Maroc', 'Vêtement Traditionnel Enfant', 'Livre Contes Marocains',
            'Lit Bébé Design Marocain', 'Poussette Luxe', 'Jeu de Société Arabe',
            'Chaussures Enfant Cuir', 'Kit Activité Créative', 'Tablette Éducative Enfant',
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

            $mode = fake()->randomElement(['sell', 'donate']);
            $product = Product::factory()->create([
                'title' => $productName,
                'description' => 'Produit de qualité pour enfants au Maroc. ' . fake()->sentence(),
                'price' => fake()->randomFloat(2, 50, 500),
                'listing_mode' => $mode,
                'status' => $mode, // status is now 'sell' or 'donate' instead of 'active'
                'user_id' => $user->id,
                'super_category_id' => $category->id,
                'views_count' => fake()->numberBetween(10, 1000),
                'favorites_count' => fake()->numberBetween(0, 50),
                'condition' => fake()->randomElement(['Neuf', 'Très bon état', 'Bon état']),
                'age_range' => fake()->randomElement(['0-2 ans', '2-5 ans', '5-8 ans', '8-12 ans']),
            ]);

            // Link to category
            $product->categories()->attach($category->id);

            // Create Moroccan address
            $cities = ['Marrakech', 'Casablanca', 'Rabat', 'Tanger', 'Fès', 'Meknès', 'Oujda', 'Agadir'];
            Address::factory()->create([
                'addressable_id' => $product->id,
                'addressable_type' => Product::class,
                'city' => $cities[array_rand($cities)],
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
        $usedPairs = [];

        foreach ($products as $product) {
            // Create 1-5 favorites per product
            $favoriteCount = rand(1, 5);
            
            for ($i = 0; $i < $favoriteCount; $i++) {
                $user = $users->random();
                $pairKey = $user->id . '-' . $product->id;
                
                // Ensure unique user-product pair
                if (!in_array($pairKey, $usedPairs)) {
                    $usedPairs[] = $pairKey;
                    Favorite::factory()->create([
                        'user_id' => $user->id,
                        'product_id' => $product->id,
                    ]);
                }
            }
        }
    }

    private function verifyDataIntegrity(): void
    {
        // Verify minimum data requirements
        if (User::count() < 5) {
            throw new Exception('Insufficient users seeded');
        }
        if (Category::count() < 8) {
            throw new Exception('Insufficient categories seeded');
        }
        if (Product::count() < 20) {
            throw new Exception('Insufficient products seeded');
        }
        if (Review::count() < 60) {
            throw new Exception('Insufficient reviews seeded');
        }
        
        // Verify each category has products
        $categories = Category::all();
        foreach ($categories as $category) {
            if ($category->products()->count() < 2) {
                throw new Exception("Category {$category->name} has insufficient products");
            }
        }
    }
}
