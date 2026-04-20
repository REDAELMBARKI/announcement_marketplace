<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── favorites ────────────────────────────────────────────────────────
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'product_id']); // one save per product per user
        });

        // ─── messages ─────────────────────────────────────────────────────────
        
        // ─── reviews ──────────────────────────────────────────────────────────
        // Buyer reviews seller after a transaction
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reviewed_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');  // 1–5
            $table->text('comment')->nullable();
            $table->timestamps();

            // One review per transaction (reviewer + product)
            $table->unique(['reviewer_id', 'product_id']);
        });

        // ─── reports ──────────────────────────────────────────────────────────
        // Users flagging bad listings
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('reason');
            $table->text('details')->nullable();
            $table->enum('status', ['pending', 'reviewed', 'dismissed'])->default('pending');
            $table->timestamps();

            $table->unique(['reporter_id', 'product_id']); // one report per user per product
        });

         Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
 
            $table->unique(['product_id', 'buyer_id']); // one thread per product per buyer
        });
 
      
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
 
            $table->string('type'); // message_received, product_favorited, review_left, product_reserved
            
            // Points to whatever triggered it (product, conversation, review...)
            $table->morphs('notifiable');
 
            $table->json('data');  // flexible payload: { title, body, url, ... }
 
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
 
            $table->index(['user_id', 'read_at']); // fast unread count queries
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('conversations');
        Schema::dropIfExists('notifications');

    }
};