<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Testing homepage repository methods individually...\n";
    
    // Test the repository directly
    $repository = $app->make('App\Repositories\Home\HomepageRepositoryInterface');
    
    echo "Testing getStats()...\n";
    $stats = $repository->getStats();
    echo "Stats: OK\n";
    
    echo "Testing getFeaturedCategories()...\n";
    $categories = $repository->getFeaturedCategories();
    echo "Featured Categories: OK (" . $categories->count() . ")\n";
    
    echo "Testing getPopularProducts()...\n";
    $products = $repository->getPopularProducts([]);
    echo "Popular Products: OK (" . $products->count() . ")\n";
    
    echo "Testing getNewArrivals()...\n";
    $newArrivals = $repository->getNewArrivals();
    echo "New Arrivals: OK (" . $newArrivals->count() . ")\n";
    
    echo "Testing getAllProductsByCategory()...\n";
    $productsByCategory = $repository->getAllProductsByCategory();
    echo "Products By Category: OK (" . count($productsByCategory) . " categories)\n";
    
    echo "Testing getTrendingTags()...\n";
    $tags = $repository->getTrendingTags();
    echo "Trending Tags: OK (" . $tags->count() . ")\n";
    
    echo "Testing getTopSellers()...\n";
    $sellers = $repository->getTopSellers();
    echo "Top Sellers: OK (" . $sellers->count() . ")\n";
    
    echo "Testing getRecentReviews()...\n";
    $reviews = $repository->getRecentReviews();
    echo "Recent Reviews: OK (" . $reviews->count() . ")\n";
    
    echo "Testing getFreeItems()...\n";
    $freeItems = $repository->getFreeItems();
    echo "Free Items: OK (" . $freeItems->count() . ")\n";
    
    echo "Testing getBoostedListings()...\n";
    $boosted = $repository->getBoostedListings();
    echo "Boosted Listings: OK (" . $boosted->count() . ")\n";
    
    echo "Testing getHeroSliders()...\n";
    $sliders = $repository->getHeroSliders();
    echo "Hero Sliders: OK (" . $sliders->count() . ")\n";
    
    echo "Testing getBanners()...\n";
    $banners = $repository->getBanners();
    echo "Banners: OK (" . $banners->count() . ")\n";
    
    echo "All repository methods work correctly!\n";
    
    if ($response instanceof \Illuminate\Http\JsonResponse) {
        echo "Controller returned JSON response\n";
        echo "Status: " . $response->getStatusCode() . "\n";
        echo "Content: " . $response->getContent() . "\n";
    } else {
        echo "Controller returned: " . get_class($response) . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
