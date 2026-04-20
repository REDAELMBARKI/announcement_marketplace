<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('categories')
                ->nullOnDelete();

            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->string('name_fr')->nullable();
            $table->string('slug')->unique();
            $table->string('icon')->nullable();       // emoji or icon class
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Example tree:
            // Clothing (parent)
            //   ├── Boys
            //   ├── Girls
            //   └── Newborn
            // Toys & Games (parent)
            //   ├── Educational
            //   └── Outdoor
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};