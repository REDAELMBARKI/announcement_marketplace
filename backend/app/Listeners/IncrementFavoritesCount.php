<?php

namespace App\Listeners;

use App\Events\ProductFavorited;
use Illuminate\Support\Facades\DB;

class IncrementFavoritesCount
{
    public function handle(ProductFavorited $event): void
    {
        DB::table('products')
            ->where('id', $event->product->id)
            ->increment('favorites_count');
    }
}
