<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('original_price', 10, 2);  // Listed price
            $table->decimal('offer_price', 10, 2);     // Offered price
            $table->enum('status', ['pending', 'accepted', 'rejected', 'countered', 'expired'])->default('pending');
            $table->text('message')->nullable();         // Buyer's message
            $table->decimal('counter_price', 10, 2)->nullable();  // Seller's counter offer
            $table->timestamp('expires_at')->nullable(); // 24h/48h expiry
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->index(['seller_id', 'status']);      // Quick query for seller's pending offers
            $table->index(['buyer_id', 'status']);       // Buyer's offer history
            $table->index(['product_id', 'status']);     // Offers on a product
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
