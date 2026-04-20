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

class HomepageSeeder extends Seeder
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
        $this->verifyDataIntegrity();

        // Re-enable foreign key checks
        DB::statement('PRAGMA foreign_keys=ON');

        $this->command->info('Homepage data seeded successfully!');
    }

    private function clearExistingData(): void
    {
        DB::table('favorites')->delete();
        DB::table('reviews')->delete();
        DB::table('addresses')->delete();
        DB::table('product_tag')->delete();
        DB::table('category_product')->delete();
        DB::table('products')->delete();
        DB::table('tags')->delete();
        DB::table('categories')->delete();
        DB::table('users')->delete();
    }

    private function createUsers(): void
    {
        // Create 5 specific Moroccan users
        $users = [
            ['name' => 'Fatima Alami', 'email' => 'fatima@example.com', 'rating' => 4.8],
            ['name' => 'Youssef Benkiran', 'email' => 'youssef@example.com', 'rating' => 4.5],
            ['name' => 'Amina Rachidi', 'email' => 'amina@example.com', 'rating' => 4.9],
            ['name' => 'Karim El Mardi', 'email' => 'karim@example.com', 'rating' => 4.7],
            ['name' => 'Sofia Mansouri', 'email' => 'sofia@example.com', 'rating' => 4.6],
        ];

        foreach ($users as $userData) {
            User::factory()->create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'rating' => $userData['rating'],
            ]);
        }
    }

    private function createCategories(): void
    {
        // Create 8 top-level Moroccan kids categories
        $categories = [
            ['name' => 'Jouets ', 'slug' => 'jouets', 'icon' => 'gamepad-2'],
            ['name' => 'Vêtements ', 'slug' => 'vetements', 'icon' => 'shirt'],
            ['name' => 'Livres ', 'slug' => 'livres', 'icon' => 'book-open'],
            ['name' => 'Mobilier ', 'slug' => 'mobilier', 'icon' => 'home'],
            ['name' => 'Bébé ', 'slug' => 'bebe', 'icon' => 'baby'],
            ['name' => 'Jeux ', 'slug' => 'jeux', 'icon' => 'gamepad-2'],
            ['name' => 'Chaussures ', 'slug' => 'chaussures', 'icon' => 'footprints'],
            ['name' => 'Activités ', 'slug' => 'activites', 'icon' => 'palette'],
        ];

        foreach ($categories as $index => $category) {
            Category::factory()->create([
                'name' => $category['name'],
                'slug' => $category['slug'],
                'icon' => $category['icon'],
                'is_active' => true,
                'sort_order' => $index + 1,
                'parent_id' => null,
            ]);
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

            $product = Product::factory()->create([
                'title' => $productName,
                'description' => 'Produit de qualité pour enfants au Maroc. ' . fake()->sentence(),
                'price' => fake()->randomFloat(2, 50, 500),
                'listing_mode' => fake()->randomElement(['sell', 'donate']),
                'status' => 'active',
                'user_id' => $user->id,
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
