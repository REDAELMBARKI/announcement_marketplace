<?php

namespace App\Observers;

use App\Models\Product;
use App\Events\ProductStatusChanged;

class ProductObserver
{
    public function created(Product $product): void
    {
        // Fire notification to followers if any
        // Implementation depends on your notification system
    }

    public function updated(Product $product): void
    {
        if ($product->wasChanged('status') && in_array($product->status, ['sold', 'donated'])) {
            event(new ProductStatusChanged($product, $product->getOriginal('status')));
        }
    }

    public function deleted(Product $product): void
    {
        // Clear related media, favorites, and tags
        $product->favorites()->delete();
        $product->tags()->detach();
        
        // Clear addresses
        $product->addresses()->delete();
        
        // Clear conversations
        $product->conversations()->delete();
    }
}
