<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\User;
use App\Models\Review;
use App\Models\Offer;
use App\Http\Resources\ProductResource;
use App\Services\AnnouncementService;
use App\Services\ProductService;
use App\Services\ReviewService;
use App\Services\OfferService;
use App\Http\Requests\ProductRequest;
use App\Http\Requests\ReviewRequest;
use App\Http\Requests\OfferRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Unified controller for managing both donations and sales announcements
class AnnouncementController extends Controller
{
     function __construct(
        protected AnnouncementService $announcementService,
        protected ProductService $productService,
        protected ReviewService $reviewService,
        protected OfferService $offerService
    ) {}

    /**
     * Toggle favorite status for an announcement.
     */
     function toggleFavorite(Request $request, Product $announcement)
    {
        try {
            // Assume authenticated user for now, or use a dummy ID for guest
            $userId = Auth::id() ?? 1;
            $res = $this->productService->toggleFavorite($userId, $announcement->id);

            return response()->json($res);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fetch initialization data for the marketplace filters.
     */
    function getMarketplaceInitData()
    {
        try {
            $data = $this->announcementService->getMarketplaceInitData();

            return response()->json(array_merge(['status' => 'success'], $data));
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fetch paginated listings with filtering.
     */
     function getMarketplaceListings(Request $request)
    {
        try {
            $filters = $request->all();
            $filters['free_only'] = $request->boolean('free_only');
            
            $listings = $this->announcementService->getMarketplaceListings(
                $filters, 
                $request->input('per_page', 12)
            );

            return response()->json([
                'status' => 'success',
                'data' => ProductResource::collection($listings)->response()->getData(true)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new announcement.
     */
     function store(ProductRequest $request)
    {
        try {
            $data = $request->validated();

            $product = $this->announcementService->createAnnouncement($data);

            return response()->json([
                'status'  => 'success',
                'message' => 'Announcement created successfully',
                'product' => new ProductResource($product),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to create announcement: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified announcement.
     */
     function show(Product $announcement)
    {
        try {
            $announcement->load(['user', 'thumbnail', 'gallery', 'superCategory', 'subCategories', 'items', 'addresses']);
            
            return response()->json([
                'status'  => 'success',
                'product' => new ProductResource($announcement),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Announcement not found',
            ], 404);
        }
    }

    /**
     * Display the specified announcement by slug.
     */
    public function showBySlug(Product $announcement)
    {
        try {
            $announcement->load(['user', 'thumbnail', 'gallery', 'superCategory', 'subCategories', 'items', 'addresses']);
            
            return response()->json([
                'status'  => 'success',
                'product' => new ProductResource($announcement),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Announcement not found',
            ], 404);
        }
    }

    /**
     * Update the specified announcement.
     */
    function update(ProductRequest $request, User $user, Product $announcement)
    {
        try {
            // Verify that the announcement belongs to the user
            if ($announcement->user_id !== $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: Announcement does not belong to this user',
                ], 403);
            }

            $data = $request->validated();
            $product = $this->announcementService->updateAnnouncement($announcement->id, $data);

            return response()->json([
                'status'  => 'success',
                'message' => 'Announcement updated successfully',
                'product' => new ProductResource($product),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to update announcement: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified announcement.
     */
     function destroy(User $user, Product $announcement)
    {
        try {
            // Verify that the announcement belongs to the user
            if ($announcement->user_id !== $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: Announcement does not belong to this user',
                ], 403);
            }

            $this->productService->deleteAnnouncement($announcement->id);

            return response()->json([
                'status'  => 'success',
                'message' => 'Announcement deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to delete announcement: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the status of an announcement.
     */
     function updateStatus(Request $request, User $user, Product $announcement)
    {
        try {
            // Verify that the announcement belongs to the user
            if ($announcement->user_id !== $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: Announcement does not belong to this user',
                ], 403);
            }

            $status = $request->input('status');
            $announcement->update(['status' => $status]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Status updated successfully',
                'product' => new ProductResource($announcement),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to update status',
            ], 500);
        }
    }

    /**
     * Fetch donations for a specific user.
     */
     function getUserDonations(User $user)
    {
        $products = Product::with(['superCategory', 'thumbnail', 'user'])
            ->where('user_id', $user->id)
            ->where('listing_mode', 'donate')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'status'   => 'success',
            'products' => ProductResource::collection($products),
        ]);
    }

    /**
     * Fetch sales for a specific user.
     */
     function getUserSales(User $user)
    {
        $products = Product::with(['superCategory', 'thumbnail', 'user'])
            ->where('user_id', $user->id)
            ->where('listing_mode', 'sell')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'status'   => 'success',
            'products' => ProductResource::collection($products),
        ]);
    }

    /**
     * Fetch announcements for a specific user by slug.
     */
    public function getUserAnnouncementsBySlug(Request $request, User $user)
    {
        // Use Gate to ensure only the owner can see their own announcements
        // This requires the user to be authenticated.
        // Gate::authorize('view-my-announcements', $user);
        
        $products = Product::with(['superCategory', 'thumbnail', 'user'])
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();
        return response()->json([
            'status'   => 'success',
            'products' => ProductResource::collection($products),
        ]);
    }

    /**
     * Fetch all active announcements.
     */
     function getAllAnnouncements()
    {
        $products = Product::with(['superCategory', 'thumbnail', 'user'])
            ->whereIn('status', ['sell', 'donate'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'status'   => 'success',
            'products' => ProductResource::collection($products),
        ]);
    }

    /**
     * Fetch announcements for a specific charity.
     */
     function getCharityAnnouncements($charityId)
    {
        $products = Product::with(['categories', 'thumbnail', 'gallery', 'user'])
            ->whereHas('categories', function ($query) use ($charityId) {
                $query->where('categories.id', $charityId);
            })
            ->whereIn('status', ['sell', 'donate'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'status'     => 'success',
            'products'   => $products,
        ]);
    }

    /**
     * Fetch all announcements for admin.
     */
     function getAllAnnouncementsForAdmin()
    {
        $products = Product::with(['superCategory', 'subCategories', 'thumbnail', 'gallery', 'user', 'items'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'status'     => 'success',
            'products'   => ProductResource::collection($products),
        ]);
    }

    /**
     * Get reviews for a specific announcement by slug.
     * Delegates to ReviewService.
     */
    public function getReviews(Product $announcement)
    {
        try {
            $reviews = $this->reviewService->getReviewsForProduct($announcement);

            return response()->json([
                'status' => 'success',
                'reviews' => $reviews,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch reviews',
            ], 500);
        }
    }

    /**
     * Store a new review for a specific announcement.
     * Uses ReviewRequest for validation, delegates to ReviewService.
     */
    public function storeReview(ReviewRequest $request, Product $announcement)
    {
        try {
            $result = $this->reviewService->storeReview(
                $announcement,
                Auth::id(),
                $request->validated('rating'),
                $request->validated('comment')
            );

            if (!$result['success']) {
                return response()->json([
                    'status' => 'error',
                    'message' => $result['message'],
                ], 422);
            }

            return response()->json([
                'status' => 'success',
                'review' => $result['review'],
                'message' => $result['message'],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to submit review',
            ], 500);
        }
    }

    /**
     * Update an existing review.
     * Only the review owner can update (enforced by ReviewPolicy).
     */
    public function updateReview(ReviewRequest $request, Review $review)
    {
        try {
            // Authorize using ReviewPolicy
            $this->authorize('update', $review);

            $result = $this->reviewService->updateReview(
                $review,
                $request->validated('rating'),
                $request->validated('comment')
            );

            return response()->json([
                'status' => 'success',
                'review' => $result['review'],
                'message' => $result['message'],
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'You can only edit your own reviews',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update review',
            ], 500);
        }
    }

    /**
     * Delete a review.
     * Only the review owner can delete (enforced by ReviewPolicy).
     */
    public function destroyReview(Review $review)
    {
        try {
            // Authorize using ReviewPolicy
            $this->authorize('delete', $review);

            $result = $this->reviewService->deleteReview($review);

            if ($result['success']) {
                return response()->json([
                    'status' => 'success',
                    'message' => $result['message'],
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => $result['message'],
            ], 500);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'You can only delete your own reviews',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete review',
            ], 500);
        }
    }

    /**
     * Get offers for a specific announcement.
     */
    public function getOffers(Product $announcement)
    {
        try {
            $offers = $this->offerService->getOffersForProduct($announcement);

            return response()->json([
                'status' => 'success',
                'offers' => $offers,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch offers',
            ], 500);
        }
    }

    /**
     * Make an offer on a product.
     */
    public function makeOffer(OfferRequest $request, Product $announcement)
    {
        try {
            $result = $this->offerService->makeOffer(
                $announcement,
                Auth::user(),
                $request->validated('offer_price'),
                $request->validated('message')
            );

            if (!$result['success']) {
                return response()->json([
                    'status' => 'error',
                    'message' => $result['message'],
                ], 422);
            }

            return response()->json([
                'status' => 'success',
                'offer' => $result['offer'],
                'message' => $result['message'],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to submit offer',
            ], 500);
        }
    }

    /**
     * Accept an offer.
     */
    public function acceptOffer(Offer $offer)
    {
        try {
            // Verify seller owns the product
            if ($offer->seller_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized',
                ], 403);
            }

            $result = $this->offerService->acceptOffer($offer);

            if (!$result['success']) {
                return response()->json([
                    'status' => 'error',
                    'message' => $result['message'],
                ], 422);
            }

            return response()->json([
                'status' => 'success',
                'offer' => $result['offer'],
                'message' => $result['message'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to accept offer',
            ], 500);
        }
    }

    /**
     * Reject an offer.
     */
    public function rejectOffer(Offer $offer)
    {
        try {
            // Verify seller owns the product
            if ($offer->seller_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized',
                ], 403);
            }

            $result = $this->offerService->rejectOffer($offer);

            if (!$result['success']) {
                return response()->json([
                    'status' => 'error',
                    'message' => $result['message'],
                ], 422);
            }

            return response()->json([
                'status' => 'success',
                'offer' => $result['offer'],
                'message' => $result['message'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to reject offer',
            ], 500);
        }
    }

    /**
     * Counter an offer with new price.
     */
    public function counterOffer(Request $request, Offer $offer)
    {
        try {
            // Verify seller owns the product
            if ($offer->seller_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized',
                ], 403);
            }

            $validated = $request->validate([
                'counter_price' => 'required|numeric|min:0.01|max:999999.99',
            ]);

            $result = $this->offerService->counterOffer($offer, $validated['counter_price']);

            if (!$result['success']) {
                return response()->json([
                    'status' => 'error',
                    'message' => $result['message'],
                ], 422);
            }

            return response()->json([
                'status' => 'success',
                'offer' => $result['offer'],
                'message' => $result['message'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to send counter offer',
            ], 500);
        }
    }

    /**
     * Accept counter offer (buyer accepts seller's counter).
     */
    public function acceptCounterOffer(Offer $offer)
    {
        try {
            // Verify buyer owns the offer
            if ($offer->buyer_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized',
                ], 403);
            }

            $result = $this->offerService->acceptCounter($offer);

            if (!$result['success']) {
                return response()->json([
                    'status' => 'error',
                    'message' => $result['message'],
                ], 422);
            }

            return response()->json([
                'status' => 'success',
                'offer' => $result['offer'],
                'message' => $result['message'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to accept counter offer',
            ], 500);
        }
    }
}
