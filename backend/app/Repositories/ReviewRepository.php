<?php

namespace App\Repositories;

use App\Models\Review;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class ReviewRepository
{
    /**
     * Get all reviews for a product with reviewer details.
     *
     * @param Product $product
     * @return Collection
     */
    public function getReviewsForProduct(Product $product): Collection
    {
        return $product->reviews()
            ->with('reviewer:id,name,avatar')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Check if user has already reviewed this product.
     *
     * @param int $productId
     * @param int $userId
     * @return bool
     */
    public function hasUserReviewed(int $productId, int $userId): bool
    {
        return Review::where('product_id', $productId)
            ->where('reviewer_id', $userId)
            ->exists();
    }

    /**
     * Create a new review.
     *
     * @param int $productId
     * @param int $reviewerId
     * @param int $rating
     * @param string $comment
     * @return Review
     */
    public function create(int $productId, int $reviewerId, int $rating, string $comment): Review
    {
        return Review::create([
            'product_id' => $productId,
            'reviewer_id' => $reviewerId,
            'rating' => $rating,
            'comment' => $comment,
        ]);
    }

    /**
     * Get review with reviewer details.
     *
     * @param int $reviewId
     * @return Review|null
     */
    public function findWithReviewer(int $reviewId): ?Review
    {
        return Review::with('reviewer:id,name,avatar')
            ->find($reviewId);
    }
}
