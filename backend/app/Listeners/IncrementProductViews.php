<?php

namespace App\Listeners;

use App\Events\ProductViewed;
use Illuminate\Support\Facades\DB;

class IncrementProductViews
{
    public function handle(ProductViewed $event): void
    {
        DB::table('products')
            ->where('id', $event->product->id)
            ->increment('views_count');
    }
}
