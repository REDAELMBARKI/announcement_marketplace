<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    /**
     * Create a user for testing
     */
    protected function createUser(array $attributes = [])
    {
        return \App\Models\User::factory()->create(array_merge([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ], $attributes));
    }

    /**
     * Create a category for testing
     */
    protected function createCategory(array $attributes = [])
    {
        return \App\Models\Category::create(array_merge([
            'name' => 'Test Category',
            'slug' => 'test-category',
            'icon' => 'test-icon',
            'is_active' => true,
        ], $attributes));
    }

    /**
     * Create media for testing
     */
    protected function createMedia(array $attributes = [])
    {
        return \App\Models\Media::create(array_merge([
            'mediable_id' => null,
            'mediable_type' => null, // Temporary media
            'disk' => 'public',
            'path' => 'test/image.jpg',
            'url' => 'http://localhost/storage/test/image.jpg',
            'file_name' => 'image.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
            'collection' => 'gallery',
            'sort_order' => 0,
            'is_temporary' => true,
        ], $attributes));
    }

    /**
     * Create temporary media collection for testing
     */
    protected function createTemporaryMediaCollection(int $count = 2): array
    {
        $media = [];
        for ($i = 0; $i < $count; $i++) {
            $media[] = $this->createMedia([
                'path' => "test/image{$i}.jpg",
                'url' => "http://localhost/storage/test/image{$i}.jpg",
                'file_name' => "image{$i}.jpg",
                'collection' => $i === 0 ? 'thumbnail' : 'gallery',
                'sort_order' => $i,
            ]);
        }
        return $media;
    }
}
