<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {   
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
 
            // Works for users (home address) and products (pickup location)
            $table->morphs('addressable');
 
            $table->string('city');
            $table->string('district')->nullable();
            $table->string('address_line')->nullable();  // street / landmark
            $table->decimal('lat', 10, 7)->nullable();   // for map pin
            $table->decimal('lng', 10, 7)->nullable();
            $table->boolean('is_default')->default(false); // user's default address
 
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('super_category_id')->constrained('categories')->nullable()->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // Listing mode: sell or donate only
            $table->enum('listing_mode', ['sell', 'donate']);

            // Collection or single item (drives whether product_items are used)
            $table->enum('listing_type', ['single', 'collection']);

            $table->string('title');
            $table->text('description')->nullable();

            // Pricing (only relevant when listing_mode = sell)
            $table->decimal('price', 10, 2)->nullable();
            $table->string('currency', 10)->default('MAD');
            $table->boolean('price_negotiable')->default(false);

            $table->string('pickup_address')->nullable();
            $table->enum('handover_method', ['pickup', 'delivery', 'both'])->nullable();

            // Status lifecycle
            $table->enum('status', [
                'sell',
                'donate',
                'reserved',
                'sold',
                'donated',
                'closed',
                'draft'
            ])->default('draft');

            $table->string('condition')->nullable();  // new, like_new, good, fair — for single items
            $table->string('gender')->nullable();     // boy, girl, unisex — for single items
            $table->string('age_range')->nullable();  // 0-3m, 3-6m, 1-3y — for single items
            $table->string('brand')->nullable();
            $table->string('season')->nullable();
            $table->json('sizes')->nullable();
            $table->json('colors')->nullable();

            // Stats
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('favorites_count')->default(0);

            $table->timestamps();
            $table->softDeletes();

            // No image columns - all images in media table (role = thumbnail / gallery)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');
        Schema::dropIfExists('products');
    }
};