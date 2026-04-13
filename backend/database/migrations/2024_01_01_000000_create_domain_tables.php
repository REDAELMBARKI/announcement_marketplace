<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Role', function (Blueprint $table) {
            $table->id('role_ID');
            $table->string('role_name');
            $table->text('role_description')->nullable();
        });

        Schema::create('User', function (Blueprint $table) {
            $table->id('user_ID');
            $table->string('user_name');
            $table->string('user_email')->unique();
            $table->string('user_password');
            $table->unsignedBigInteger('role_ID')->nullable();
        });

        Schema::create('Charity', function (Blueprint $table) {
            $table->id('charity_ID');
            $table->string('charity_name');
            $table->string('charity_address');
            $table->string('charity_email');
            $table->string('contact_person')->nullable();
        });

        Schema::create('Charity_Staff', function (Blueprint $table) {
            $table->id('staff_ID');
            $table->unsignedBigInteger('charity_ID');
            $table->unsignedBigInteger('user_ID');

            $table->foreign('charity_ID')->references('charity_ID')->on('Charity')->onDelete('cascade');
            $table->foreign('user_ID')->references('user_ID')->on('User')->onDelete('cascade');
        });

        Schema::create('Donor', function (Blueprint $table) {
            $table->id('donor_ID');
            $table->string('donor_address');
            $table->unsignedBigInteger('user_ID');

            $table->foreign('user_ID')->references('user_ID')->on('User')->onDelete('cascade');
        });

        Schema::create('Donation', function (Blueprint $table) {
            $table->id('donation_ID');
            $table->unsignedBigInteger('donor_ID');
            $table->unsignedBigInteger('charity_ID');
            $table->string('donation_status');
            $table->date('donation_date');
            $table->string('pickup_address');

            $table->foreign('donor_ID')->references('donor_ID')->on('Donor')->onDelete('cascade');
            $table->foreign('charity_ID')->references('charity_ID')->on('Charity')->onDelete('cascade');
        });

        Schema::create('Donation_Item', function (Blueprint $table) {
            $table->id('item_ID');
            $table->unsignedBigInteger('donation_ID');
            $table->string('item_name');
            $table->string('item_category')->nullable();
            $table->string('item_size')->nullable();
            $table->string('item_condition')->nullable();
            $table->text('item_description')->nullable();
            $table->string('item_image')->nullable();

            $table->foreign('donation_ID')->references('donation_ID')->on('Donation')->onDelete('cascade');
        });

        Schema::create('Inventory', function (Blueprint $table) {
            $table->id('inventory_ID');
            $table->unsignedBigInteger('charity_ID');
            $table->string('item');
            $table->string('category');
            $table->string('size');
            $table->integer('quantity');

            $table->foreign('charity_ID')->references('charity_ID')->on('Charity')->onDelete('cascade');
        });
        

    }

    public function down(): void
    {

        Schema::dropIfExists('Inventory');
        Schema::dropIfExists('Donation_Item');
        Schema::dropIfExists('Donation');
        Schema::dropIfExists('Donor');
        Schema::dropIfExists('Charity_Staff');
        Schema::dropIfExists('Charity');
        Schema::dropIfExists('User');
        Schema::dropIfExists('Role');
    }
};
