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
        Schema::create('Role', function (Blueprint $table) {
            $table->id('role_ID');
            $table->string('role_name');
            $table->text('role_description')->nullable();
        });

        // Insert default roles
        DB::table('Role')->insert([
            ['role_ID' => 10, 'role_name' => 'donor', 'role_description' => 'Regular user who can donate or buy items'],
            ['role_ID' => 11, 'role_name' => 'charity_staff', 'role_description' => 'Staff member of a charity organization'],
            ['role_ID' => 12, 'role_name' => 'admin', 'role_description' => 'System administrator'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('Role');
    }
};
