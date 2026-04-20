<?php

namespace App\Observers;

use App\Models\User;
use App\Services\Home\HomepageService;
use Illuminate\Support\Facades\App;

class UserObserver
{
    public function created(User $user): void
    {
        $this->clearHomepageCache();
    }

    public function updated(User $user): void
    {
        $this->clearHomepageCache();
    }

    public function deleted(User $user): void
    {
        $this->clearHomepageCache();
    }

    private function clearHomepageCache(): void
    {
        $homepageService = app(HomepageService::class);
        $homepageService->clearHomepageCache();
    }
}
