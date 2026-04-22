<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('filter_attributes', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->string('group')->unique(); // e.g., 'ageRanges', 'cities'
            $blueprint->json('data');
            $blueprint->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('filter_attributes');
    }
};
