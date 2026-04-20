<?php

namespace App\Observers;

use App\Models\Favorite;
use App\Services\Home\HomepageService;
use Illuminate\Support\Facades\App;

class FavoriteObserver
{
    public function created(Favorite $favorite): void
    {
        $this->clearHomepageCache();
    }

    public function deleted(Favorite $favorite): void
    {
        $this->clearHomepageCache();
    }

    private function clearHomepageCache(): void
    {
        $homepageService = app(HomepageService::class);
        $homepageService->clearHomepageCache();
    }
}
