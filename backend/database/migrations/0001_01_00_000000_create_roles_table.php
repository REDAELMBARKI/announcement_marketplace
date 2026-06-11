<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();       
            $table->text('description')->nullable();
            $table->json('claims')->nullable();
            $table->timestamps();
        });

        // Insert default roles
        DB::table('roles')->insert([
            [
                'id' => 10,
                'name' => 'donor',
                'slug' => 'donor',
                'description' => 'Regular user who can donate or buy items',
                'claims' => json_encode(['can_donate' => true, 'can_buy' => true]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 11,
                'name' => 'charity_staff',
                'slug' => 'charity-staff',
                'description' => 'Staff member of a charity organization',
                'claims' => json_encode(['can_manage_donations' => true, 'can_view_inventory' => true]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 12,
                'name' => 'admin',
                'slug' => 'admin',
                'description' => 'System administrator',
                'claims' => json_encode(['all_access' => true]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
