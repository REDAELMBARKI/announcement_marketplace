<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();

            // Polymorphic columns - works for users (avatar), products (gallery/thumbnail), etc.
            $table->nullableMorphs('mediable'); // creates mediable_id + mediable_type (both nullable)

            $table->string('disk')->default('public');        // s3, public, local
            $table->string('path');                           // full path in disk
            $table->string('url')->nullable();                // public URL (cached)
            $table->string('file_name');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->nullable();   // bytes

            // Type of media within its context
            $table->enum('collection', [
                'avatar',       // user profile picture
                'thumbnail',    // product main/cover image
                'gallery',      // product extra photos
                'document',     // any file attachment
            ])->default('gallery');

            $table->unsignedInteger('sort_order')->default(0); // ordering within gallery
            $table->boolean('is_temporary')->default(false); // for temporary uploads   
            $table->timestamps();

            // Indexes for fast polymorphic lookups
            $table->index(['mediable_type', 'mediable_id', 'collection']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};