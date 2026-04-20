<?php

namespace App\Observers;

use App\Events\ProductStatusChanged;
use App\Models\Product;
use App\Services\Home\HomepageService;
use Illuminate\Support\Facades\App;

class ProductObserver
{
    public function created(Product $product): void
    {
        // Clear homepage cache when new product is created
        $this->clearHomepageCache();
        
        // Fire notification to followers if any
        // Implementation depends on your notification system
    }

    public function updated(Product $product): void
    {
        // Clear homepage cache when product is updated
        $this->clearHomepageCache();
        
        if ($product->wasChanged('status') && in_array($product->status, ['sold', 'donated'])) {
            event(new ProductStatusChanged($product, $product->getOriginal('status')));
        }
    }

    public function deleted(Product $product): void
    {
        // Clear homepage cache when product is deleted
        $this->clearHomepageCache();
        
        // Clear related media, favorites, and tags
        $product->favorites()->delete();
        $product->tags()->detach();
        
        // Clear addresses
        $product->addresses()->delete();
        
        // Clear conversations
        $product->conversations()->delete();
    }

    private function clearHomepageCache(): void
    {
        $homepageService = app(HomepageService::class);
        $homepageService->clearHomepageCache();
    }
}
