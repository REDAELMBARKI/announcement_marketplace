<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SlugSeeder extends Seeder
{
    public function run(): void
    {
        User::all()->each(function ($u) {
            $u->update(['slug' => Str::slug($u->name) . '-' . $u->id]);
        });
        Product::all()->each(function ($p) {
            $p->update(['slug' => Str::slug($p->title) . '-' . $p->id]);
        });
    }
}
