<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\User;
use App\Http\Resources\ProductResource;
use App\Services\AnnouncementService;
use App\Services\ProductService;
use App\Http\Requests\ProductRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

// Unified controller for managing both donations and sales announcements
class AnnouncementController extends Controller
{
     function __construct(
        protected AnnouncementService $announcementService,
        protected ProductService $productService
    ) {}

    /**
     * Toggle favorite status for an announcement.
     */
     function toggleFavorite(Request $request, Product $announcement)
    {
        try {
            // Assume authenticated user for now, or use a dummy ID for guest
            $userId = auth()->id() ?? 1;
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
    public function showBySlug(User $user, Product $announcement)
    {
        try {
            // Verify that the announcement belongs to the user
            if ($announcement->user_id !== $user->id) {
                throw new \Exception('Announcement does not belong to this user');
            }

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
}
