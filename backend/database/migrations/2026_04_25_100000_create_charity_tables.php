<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('Charity')) {
            Schema::create('Charity', function (Blueprint $table) {
                $table->id('charity_ID');
                $table->string('charity_name');
                $table->string('charity_address')->nullable();
                $table->string('charity_email');
                $table->string('contact_person')->nullable();
                $table->string('charity_phone')->nullable();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('Charity_Staff')) {
            Schema::create('Charity_Staff', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('charity_ID');
                $table->unsignedBigInteger('user_ID');
                $table->timestamps();

                $table->unique(['charity_ID', 'user_ID']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('Charity_Staff');
        Schema::dropIfExists('Charity');
    }
};
