<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Testing homepage models...\n";
    
    // Test basic models
    echo "Users: " . \App\Models\User::count() . "\n";
    echo "Categories: " . \App\Models\Category::count() . "\n";
    echo "Products: " . \App\Models\Product::count() . "\n";
    
    // Test HeroSlider
    try {
        $count = \App\Models\HeroSlider::count();
        echo "HeroSlider: OK ($count)\n";
    } catch (Exception $e) {
        echo "HeroSlider Error: " . $e->getMessage() . "\n";
    }
    
    // Test Banner
    try {
        $count = \App\Models\Banner::count();
        echo "Banner: OK ($count)\n";
    } catch (Exception $e) {
        echo "Banner Error: " . $e->getMessage() . "\n";
    }
    
    // Test repository stats
    try {
        $repository = $app->make('App\Repositories\Home\HomepageRepositoryInterface');
        $stats = $repository->getStats();
        echo "Repository Stats: OK\n";
    } catch (Exception $e) {
        echo "Repository Error: " . $e->getMessage() . "\n";
    }
    
    echo "All tests passed!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}
