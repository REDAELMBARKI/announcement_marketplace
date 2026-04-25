<?php

namespace App\Observers;

use App\Models\Favorite;

class FavoriteObserver
{
    public function created(Favorite $favorite): void
    {
    }

    public function deleted(Favorite $favorite): void
    {
    }
}
