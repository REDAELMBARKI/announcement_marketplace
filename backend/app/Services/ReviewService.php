<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Review;
use App\Repositories\ReviewRepository;
use Illuminate\Database\Eloquent\Collection;

class ReviewService
{
    public function __construct(
        protected ReviewRepository $reviewRepository
    ) {}

    /**
     * Get all reviews for a product.
     *
     * @param Product $product
     * @return Collection
     */
    public function getReviewsForProduct(Product $product): Collection
    {
        return $this->reviewRepository->getReviewsForProduct($product);
    }

    /**
     * Store a new review.
     *
     * @param Product $product
     * @param int $reviewerId
     * @param int $rating
     * @param string $comment
     * @return array
     */
    public function storeReview(Product $product, int $reviewerId, int $rating, string $comment): array
    {
        // Check if user already reviewed this product
        if ($this->reviewRepository->hasUserReviewed($product->id, $reviewerId)) {
            return [
                'success' => false,
                'message' => 'You have already reviewed this item',
            ];
        }

        // Create the review
        $review = $this->reviewRepository->create(
            $product->id,
            $reviewerId,
            $rating,
            $comment
        );

        // Load reviewer relationship for response
        $review->load('reviewer:id,name,avatar');

        return [
            'success' => true,
            'review' => $review,
            'message' => 'Review submitted successfully',
        ];
    }
}
