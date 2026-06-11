<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaUploadTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a test user and authenticate
        $this->user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);
        
        $this->actingAs($this->user, 'sanctum');
    }

    public function test_can_upload_media()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('test.jpg');

        $response = $this->postJson('/api/media/upload', [
            'image' => $file,
            'mediable_type' => 'product',
            'collection' => 'gallery',
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'status' => 'success',
        ]);

        $this->assertDatabaseHas('media', [
            'file_name' => 'test.jpg',
            'is_temporary' => 1,
        ]);
    }
}
