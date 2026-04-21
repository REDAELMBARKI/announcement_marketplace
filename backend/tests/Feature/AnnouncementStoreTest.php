<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Media;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AnnouncementStoreTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $category;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a test user
        $this->user = \App\Models\User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);
        
        // Create a test category
        $this->category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
            'icon' => 'test-icon',
            'is_active' => true,
        ]);
    }

    public function test_can_store_announcement_with_media_ids()
    {
        // Create temporary media collection
        $mediaCollection = $this->createTemporaryMediaCollection(2);

        $announcementData = [
            'user_id' => $this->user->id,
            'super_category_id' => $this->category->id,
            'title' => 'Test Product',
            'description' => 'Test Description',
            'listing_mode' => 'sell',
            'listing_type' => 'single',
            'price' => 100.50,
            'currency' => 'MAD',
            'price_negotiable' => 1,
            'condition' => 'Bon état',
            'gender' => 'garcon',
            'age_range' => '3-5 ans',
            'brand' => 'Test Brand',
            'season' => 'été',
            'sizes' => ['4A', '5A'],
            'colors' => ['Rouge', 'Bleu'],
            'pickup_address' => '123 Test Street, Marrakech',
            'handover_method' => 'both',
            'media_ids' => array_map(fn($media) => (int)$media->id, $mediaCollection),
        ];

        $response = $this->postJson('/api/announcements', $announcementData);

        $response->assertStatus(201);
        $response->assertJson([
            'status' => 'success',
            'message' => 'Sale listing created successfully!',
        ]);

        // Verify product was created
        $this->assertDatabaseHas('products', [
            'user_id' => $this->user->id,
            'title' => 'Test Product',
            'description' => 'Test Description',
            'listing_mode' => 'sell',
            'listing_type' => 'single',
            'price' => 100.50,
            'currency' => 'MAD',
            'price_negotiable' => 1,
            'condition' => 'Bon état',
            'gender' => 'garcon',
            'age_range' => '3-5 ans',
            'brand' => 'Test Brand',
            'season' => 'été',
            'pickup_address' => '123 Test Street, Marrakech',
            'handover_method' => 'both',
        ]);

        // Verify media was linked and marked as permanent
        $media1 = $mediaCollection[0];
        $media2 = $mediaCollection[1];
        
        $this->assertDatabaseHas('media', [
            'id' => $media1->id,
            'mediable_id' => 1,
            'mediable_type' => 'App\\Models\\Product',
            'collection' => 'thumbnail',
            'is_temporary' => 0,
        ]);

        $this->assertDatabaseHas('media', [
            'id' => $media2->id,
            'mediable_id' => 1,
            'mediable_type' => 'App\\Models\\Product',
            'collection' => 'gallery',
            'is_temporary' => 0,
        ]);

        // Verify super category was attached
        $product = Product::first();
        $this->assertEquals($this->category->id, $product->super_category_id);
    }

    public function test_cannot_store_announcement_without_media_ids()
    {
        $announcementData = [
            'user_id' => 1,
            'super_category_id' => 1,
            'title' => 'Test Product',
            'description' => 'Test Description',
            'listing_mode' => 'sell',
            'listing_type' => 'single',
            'price' => 100.50,
            'currency' => 'MAD',
            'price_negotiable' => 1,
            'condition' => 'Bon état',
            'gender' => 'garcon',
            'age_range' => '3-5 ans',
            'brand' => 'Test Brand',
            'season' => 'été',
            'sizes' => ['4A'],
            'colors' => ['Rouge'],
            'pickup_address' => '123 Test Street, Marrakech',
            'handover_method' => 'both',
            // Missing media_ids
        ];

        $response = $this->postJson('/api/announcements', $announcementData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['media_ids']);
    }

    public function test_cannot_store_announcement_with_nonexistent_media_ids()
    {
        $announcementData = [
            'user_id' => $this->user->id,
            'super_category_id' => $this->category->id,
            'title' => 'Test Product',
            'description' => 'Test Description',
            'listing_mode' => 'sell',
            'listing_type' => 'single',
            'price' => 100.50,
            'currency' => 'MAD',
            'price_negotiable' => 1,
            'condition' => 'Bon état',
            'gender' => 'garcon',
            'age_range' => '3-5 ans',
            'brand' => 'Test Brand',
            'season' => 'été',
            'sizes' => ['4A'],
            'colors' => ['Rouge'],
            'pickup_address' => '123 Test Street, Marrakech',
            'handover_method' => 'both',
            'media_ids' => [999, 1000], // Non-existent media IDs
        ];

        $response = $this->postJson('/api/announcements', $announcementData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['media_ids.0', 'media_ids.1']);
    }

    public function test_can_store_donation_announcement()
    {
        // Create temporary media
        $media = Media::create([
            'mediable_id' => null,
            'mediable_type' => null,
            'disk' => 'public',
            'path' => 'test/donation.jpg',
            'url' => 'http://localhost/storage/test/donation.jpg',
            'file_name' => 'donation.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
            'collection' => 'thumbnail',
            'sort_order' => 0,
            'is_temporary' => true,
        ]);

        $donationData = [
            'user_id' => $this->user->id,
            'super_category_id' => $this->category->id,
            'title' => 'Test Donation',
            'description' => 'Test Donation Description',
            'listing_mode' => 'donate',
            'listing_type' => 'single',
            // No price for donations
            'currency' => 'MAD',
            'price_negotiable' => 0,
            'condition' => 'Très bon état',
            'gender' => 'fille',
            'age_range' => '0-2 ans',
            'brand' => 'Test Brand',
            'season' => 'toutes saisons',
            'sizes' => ['6M'],
            'colors' => ['Rose'],
            'pickup_address' => '456 Donation Street, Casablanca',
            'handover_method' => 'pickup',
            'media_ids' => [$media->id],
        ];

        $response = $this->postJson('/api/announcements', $donationData);

        $response->assertStatus(201);
        $response->assertJson([
            'status' => 'success',
            'message' => 'Donation submitted successfully!',
        ]);

        // Verify product was created as donation
        $this->assertDatabaseHas('products', [
            'user_id' => $this->user->id,
            'title' => 'Test Donation',
            'description' => 'Test Donation Description',
            'listing_mode' => 'donate',
            'listing_type' => 'single',
            'price' => null,
            'currency' => 'MAD',
            'price_negotiable' => 0,
            'condition' => 'Très bon état',
            'gender' => 'fille',
            'age_range' => '0-2 ans',
            'brand' => 'Test Brand',
            'season' => 'toutes saisons',
            'pickup_address' => '456 Donation Street, Casablanca',
            'handover_method' => 'pickup',
        ]);
    }

    public function test_cannot_link_permanent_media_to_announcement()
    {
        // Create an existing product to link permanent media to
        $existingProduct = Product::create([
            'user_id' => 1,
            'super_category_id' => $this->category->id,
            'title' => 'Existing Product',
            'listing_mode' => 'sell',
            'listing_type' => 'single',
            'price' => 50,
            'currency' => 'MAD',
            'status' => 'active',
        ]);
        
        // Create permanent media (already linked to another product)
        $permanentMedia = Media::create([
            'mediable_id' => $existingProduct->id,
            'mediable_type' => 'App\\Models\\Product',
            'disk' => 'public',
            'path' => 'test/permanent.jpg',
            'url' => 'http://localhost/storage/test/permanent.jpg',
            'file_name' => 'permanent.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
            'collection' => 'gallery',
            'sort_order' => 0,
            'is_temporary' => 0,
        ]);

        $announcementData = [
            'user_id' => $this->user->id,
            'super_category_id' => $this->category->id,
            'title' => 'Test Product',
            'description' => 'Test Description',
            'listing_mode' => 'sell',
            'listing_type' => 'single',
            'price' => 100.50,
            'currency' => 'MAD',
            'price_negotiable' => 1,
            'condition' => 'Bon état',
            'gender' => 'garcon',
            'age_range' => '3-5 ans',
            'brand' => 'Test Brand',
            'season' => 'été',
            'sizes' => ['4A'],
            'colors' => ['Rouge'],
            'pickup_address' => '123 Test Street, Marrakech',
            'handover_method' => 'both',
            'media_ids' => [$permanentMedia->id], // Try to link permanent media
        ];

        $response = $this->postJson('/api/announcements', $announcementData);

        // Should succeed but not link the permanent media
        $response->assertStatus(201);
        
        // Permanent media should remain unchanged
        $this->assertDatabaseHas('media', [
            'id' => $permanentMedia->id,
            'mediable_id' => $existingProduct->id, // Still linked to original product
            'mediable_type' => 'App\\Models\\Product',
            'is_temporary' => 0,
        ]);
    }

    public function test_categories_are_synced_when_creating_announcement()
    {
        // Create multiple categories
        $category1 = $this->category;
        $category2 = Category::create([
            'name' => 'Second Category',
            'slug' => 'second-category',
            'icon' => 'second-icon',
            'is_active' => true,
        ]);

        // Create temporary media
        $media = $this->createMedia();

        $announcementData = [
            'user_id' => $this->user->id,
            'super_category_id' => $category1->id,
            'sub_category_ids' => [$category2->id], // Multiple sub-categories
            'title' => 'Multi-Category Product',
            'description' => 'Test Description',
            'listing_mode' => 'sell',
            'listing_type' => 'single',
            'price' => 100.00,
            'currency' => 'MAD',
            'price_negotiable' => 0,
            'condition' => 'Bon état',
            'gender' => 'garcon',
            'age_range' => '3-5 ans',
            'brand' => 'Test Brand',
            'season' => 'été',
            'sizes' => ['4A'],
            'colors' => ['Rouge'],
            'pickup_address' => '123 Test Street, Marrakech',
            'handover_method' => 'both',
            'media_ids' => [$media->id],
        ];

        $response = $this->postJson('/api/announcements', $announcementData);

        $response->assertStatus(201);

        // Verify product was created
        $product = Product::first();
        $this->assertNotNull($product);

        // Verify super category is set on product
        $this->assertEquals($category1->id, $product->super_category_id);
        
        // Verify sub-categories are attached via pivot table
        $this->assertDatabaseHas('subcategory_product', [
            'product_id' => $product->id,
            'category_id' => $category2->id,
        ]);

        // Verify super category is set
        $this->assertEquals($category1->id, $product->super_category_id);
        
        // Verify sub-categories are attached via pivot table
        $this->assertTrue($product->subCategories->contains($category2->id));
        $this->assertCount(1, $product->subCategories);
    }

    public function test_super_and_sub_categories_work_together()
    {
        // Test that super_category and sub_categories work together
        $superCategory = $this->category;
        $subCategory = Category::create([
            'name' => 'Sub Category',
            'slug' => 'sub-category',
            'icon' => 'sub-icon',
            'is_active' => true,
        ]);
        
        $media = $this->createMedia();

        $announcementData = [
            'user_id' => $this->user->id,
            'super_category_id' => $superCategory->id, // Required super category
            'sub_category_ids' => [$subCategory->id],   // Optional sub categories
            'title' => 'Product with Super and Sub Categories',
            'description' => 'Test Description',
            'listing_mode' => 'sell',
            'listing_type' => 'single',
            'price' => 100.00,
            'currency' => 'MAD',
            'price_negotiable' => 0,
            'condition' => 'Bon état',
            'gender' => 'garcon',
            'age_range' => '3-5 ans',
            'brand' => 'Test Brand',
            'season' => 'été',
            'sizes' => ['4A'],
            'colors' => ['Rouge'],
            'pickup_address' => '123 Test Street, Marrakech',
            'handover_method' => 'both',
            'media_ids' => [$media->id],
        ];

        $response = $this->postJson('/api/announcements', $announcementData);

        $response->assertStatus(201);

        // Verify product was created with super category
        $product = Product::first();
        $this->assertNotNull($product);
        $this->assertEquals($superCategory->id, $product->super_category_id);
        
        // Verify sub category is attached via pivot
        $this->assertTrue($product->subCategories->contains($subCategory->id));
        $this->assertCount(1, $product->subCategories);
    }
}
