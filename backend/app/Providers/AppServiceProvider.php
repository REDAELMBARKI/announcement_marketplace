<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Favorite;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Observers\CategoryObserver;
use App\Observers\FavoriteObserver;
use App\Observers\ProductObserver;
use App\Observers\ReviewObserver;
use App\Observers\UserObserver;
use App\Repositories\Home\HomepageRepository;
use App\Repositories\Home\HomepageRepositoryInterface;
use App\Repositories\ProductRepository;
use App\Repositories\ProductRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(HomepageRepositoryInterface::class, HomepageRepository::class);
        $this->app->bind(ProductRepositoryInterface::class, ProductRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Product::observe(ProductObserver::class);
        Review::observe(ReviewObserver::class);
        Category::observe(CategoryObserver::class);
        User::observe(UserObserver::class);
        Favorite::observe(FavoriteObserver::class);
    }
}
