<?php

namespace App\Observers;

use App\Models\Category;
use App\Services\Home\HomepageService;
use Illuminate\Support\Facades\App;

class CategoryObserver
{
    public function created(Category $category): void
    {
        $this->clearHomepageCache();
    }

    public function updated(Category $category): void
    {
        $this->clearHomepageCache();
    }

    public function deleted(Category $category): void
    {
        $this->clearHomepageCache();
    }

    private function clearHomepageCache(): void
    {
        $homepageService = app(HomepageService::class);
        $homepageService->clearHomepageCache();
    }
}
