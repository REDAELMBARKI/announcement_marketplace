<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('Donation', function (Blueprint $table) {
            $table->string('pickup_city')->nullable()->after('pickup_address');
            $table->string ('pickup_district')->nullable()->after('pickup_city');
            $table->string('handover_method')->nullable()->after('pickup_district');
        });

        Schema::table('Donation_Item', function (Blueprint $table) {
            $table->string('listing_type')->nullable()->after('item_name');
            $table->decimal('item_price', 10, 2)->nullable()->after('listing_type');
            $table->string('item_currency', 10)->nullable()->after('item_price');
            $table->boolean('price_negotiable')->default(false)->after('item_currency');
            $table->string('item_gender')->nullable()->after('item_condition');
            $table->string('recommended_age')->nullable()->after('item_gender');
            $table->string('item_brand')->nullable()->after('recommended_age');
            $table->string('item_material')->nullable()->after('item_brand');
            $table->string('item_season')->nullable()->after('item_material');
            $table->integer('item_quantity')->default(1)->after('item_season');
            $table->text('item_sizes')->nullable()->after('item_quantity');
            $table->text('item_colors')->nullable()->after('item_sizes');
            $table->text('item_gallery')->nullable()->after('item_colors');
            $table->unsignedInteger('primary_photo_index')->default(0)->after('item_gallery');
        });
    }

    public function down(): void
    {
        Schema::table('Donation_Item', function (Blueprint $table) {
            $table->dropColumn([
                'listing_type',
                'item_price',
                'item_currency',
                'price_negotiable',
                'item_gender',
                'recommended_age',
                'item_brand',
                'item_material',
                'item_season',
                'item_quantity',
                'item_sizes',
                'item_colors',
                'item_gallery',
                'primary_photo_index',
            ]);
        });

        Schema::table('Donation', function (Blueprint $table) {
            $table->dropColumn(['pickup_city', 'pickup_district', 'handover_method']);
        });
    }
};
