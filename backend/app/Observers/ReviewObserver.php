<?php

namespace App\Observers;

use App\Models\Review;
use App\Models\User;
use App\Services\Home\HomepageService;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;

class ReviewObserver
{
    public function created(Review $review): void
    {
        // Clear homepage cache when new review is created
        $this->clearHomepageCache();
        
        // Recalculate users.rating and users.total_reviews for the reviewed user
        $reviewedId = $review->reviewed_id;
        
        $stats = DB::table('reviews')
            ->where('reviewed_id', $reviewedId)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total_reviews')
            ->first();
        
        DB::table('users')
            ->where('id', $reviewedId)
            ->update([
                'rating' => round($stats->avg_rating, 1),
                'total_reviews' => $stats->total_reviews,
            ]);
    }

    private function clearHomepageCache(): void
    {
        $homepageService = app(HomepageService::class);
        $homepageService->clearHomepageCache();
    }
}
