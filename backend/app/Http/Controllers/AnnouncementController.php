<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductItem;
use App\Models\Media;
use App\Models\Category;
use App\Models\Favorite;
use App\Http\Resources\ProductResource;
use App\Services\AnnouncementService;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

// Unified controller for managing both donations and sales announcements
class AnnouncementController extends Controller
{
     function __construct(
        protected AnnouncementService $announcementService,
        protected ProductService $productService
    ) {}

     function toggleFavorite(Request $request, $productId)
    {
        // For now, we'll use a hardcoded user_id or get it from auth if implemented
        $userId = $request->input('user_id') ?? 1;
        
        $result = $this->productService->toggleFavorite($userId, $productId);

        return response()->json([
            'status' => 'success',
            'message' => $result['message'],
            'is_favorited' => $result['is_favorited'],
            'favorites_count' => $result['favorites_count']
        ]);
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
     function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'super_category_id' => 'required|exists:categories,id',
            'listing_mode'      => 'required|in:sell,donate',
            'title'             => 'required|string|max:255',
            'condition'         => 'required|string',
            'age_range'         => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();
            $data['user_id'] = $request->input('user_id') ?? 1;

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
     function show($id)
    {
        try {
            $product = Product::with(['user', 'thumbnail', 'gallery', 'superCategory', 'subCategories', 'items', 'addresses'])->findOrFail($id);
            
            return response()->json([
                'status'  => 'success',
                'product' => new ProductResource($product),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Announcement not found',
            ], 404);
        }
    }

    /**
     * Remove the specified announcement.
     */
     function destroy($id)
    {
        try {
            $this->productService->deleteAnnouncement($id);

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
     function updateStatus(Request $request, $announcementId)
    {
        try {
            $status = $request->input('status');
            $product = Product::findOrFail($announcementId);
            $product->update(['status' => $status]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Status updated successfully',
                'product' => new ProductResource($product),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to update status',
            ], 500);
        }
    }

    /**
     * Fetch announcements for a specific user.
     */
     function getUserAnnouncements($userId)
    {
        $products = Product::with(['superCategory', 'thumbnail', 'user'])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'status'   => 'success',
            'products' => ProductResource::collection($products),
        ]);
    }

    /**
     * Fetch donations for a specific user.
     */
     function getUserDonations($userId)
    {
        $products = Product::with(['superCategory', 'thumbnail', 'user'])
            ->where('user_id', $userId)
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
     function getUserSales($userId)
    {
        $products = Product::with(['superCategory', 'thumbnail', 'user'])
            ->where('user_id', $userId)
            ->where('listing_mode', 'sell')
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
