<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductItem;
use App\Models\Media;
use App\Models\Category;
use App\Http\Resources\ProductResource;
use App\Services\ProductService;
use Illuminate\Http\Request;

// Unified controller for managing both donations and sales announcements
class AnnouncementController extends Controller
{
    public function __construct(
        protected ProductService $productService
    ) {}

    /**
     * Fetch initialization data for the marketplace filters.
     */
    public function getMarketplaceInitData()
    {
        try {
            $categories = Category::whereNull('parent_id')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name as label', 'icon', 'slug']);

            $ageRanges = [
                ['id' => 1, 'label' => '0-1 ans', 'value' => '0-1 ans'],
                ['id' => 2, 'label' => '1-3 ans', 'value' => '1-3 ans'],
                ['id' => 3, 'label' => '3-6 ans', 'value' => '3-6 ans'],
                ['id' => 4, 'label' => '6-10 ans', 'value' => '6-10 ans'],
                ['id' => 5, 'label' => '10-14 ans', 'value' => '10-14 ans'],
            ];

            $clothingSizes = [
                ['id' => 1, 'label' => '3 mois', 'value' => '3m'],
                ['id' => 2, 'label' => '6 mois', 'value' => '6m'],
                ['id' => 3, 'label' => '1T', 'value' => '1t'],
                ['id' => 4, 'label' => '2T', 'value' => '2t'],
                ['id' => 5, 'label' => '4T', 'value' => '4t'],
            ];

            $shoeSizes = [
                ['id' => 1, 'label' => '20 EU', 'value' => '20'],
                ['id' => 2, 'label' => '24 EU', 'value' => '24'],
                ['id' => 3, 'label' => '28 EU', 'value' => '28'],
                ['id' => 4, 'label' => '32 EU', 'value' => '32'],
            ];

            $conditions = [
                ['id' => 1, 'label' => 'Neuf', 'value' => 'Neuf', 'color' => '#00b894'],
                ['id' => 2, 'label' => 'Très bon état', 'value' => 'Très bon état', 'color' => '#0984e3'],
                ['id' => 3, 'label' => 'Bon état', 'value' => 'Bon état', 'color' => '#fdcb6e'],
                ['id' => 4, 'label' => 'État correct', 'value' => 'État correct', 'color' => '#e17055'],
            ];

            $listingTypes = [
                ['id' => 1, 'label' => 'À vendre', 'icon' => '🛒', 'value' => 'sell'],
                ['id' => 2, 'label' => 'À donner / Gratuit', 'icon' => '🎁', 'value' => 'donate'],
                ['id' => 3, 'label' => 'Échange', 'icon' => '🔄', 'value' => 'swap'],
            ];

            $cities = [
                ['id' => 1, 'label' => 'Casablanca', 'districts' => [['id' => 101, 'label' => 'Maarif'], ['id' => 102, 'label' => 'Anfa']]],
                ['id' => 2, 'label' => 'Rabat', 'districts' => [['id' => 201, 'label' => 'Agdal'], ['id' => 202, 'label' => 'Hay Riad']]],
                ['id' => 3, 'label' => 'Marrakech', 'districts' => [['id' => 301, 'label' => 'Gueliz'], ['id' => 302, 'label' => 'Hivernage']]],
                ['id' => 4, 'label' => 'Agadir', 'districts' => [['id' => 401, 'label' => 'Cité Dakhla'], ['id' => 402, 'label' => 'Bensergao']]],
                ['id' => 5, 'label' => 'Tanger', 'districts' => [['id' => 501, 'label' => 'Malabata'], ['id' => 502, 'label' => 'Marshane']]],
            ];

            return response()->json([
                'status' => 'success',
                'categories' => $categories,
                'cities' => $cities,
                'ageRanges' => $ageRanges,
                'clothingSizes' => $clothingSizes,
                'shoeSizes' => $shoeSizes,
                'conditions' => $conditions,
                'listingTypes' => $listingTypes,
            ]);
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
    public function getMarketplaceListings(Request $request)
    {
        try {
            $query = Product::with(['user', 'thumbnail', 'gallery', 'superCategory', 'subCategories'])
                ->whereIn('status', ['sell', 'donate']);

            // Search filter
            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Category filter
            if ($request->filled('category')) {
                $query->where('super_category_id', $request->input('category'));
            }

            // Listing mode filter (sell/donate)
            if ($request->filled('mode') && $request->input('mode') !== 'all') {
                $query->where('listing_mode', $request->input('mode'));
            }

            // Age range filter
            if ($request->filled('age_range')) {
                $query->where('age_range', $request->input('age_range'));
            }

            // Gender filter
            if ($request->filled('gender')) {
                $query->where('gender', $request->input('gender'));
            }

            // Condition filter
            if ($request->filled('condition')) {
                $query->where('condition', $request->input('condition'));
            }

            // Price filters
            if ($request->filled('min_price')) {
                $query->where('price', '>=', $request->input('min_price'));
            }
            if ($request->filled('max_price')) {
                $query->where('price', '<=', $request->input('max_price'));
            }
            if ($request->boolean('free_only')) {
                $query->where('listing_mode', 'donate');
            }

            // Sorting
            $sort = $request->input('sort', 'newest');
            switch ($sort) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'newest':
                default:
                    $query->orderBy('created_at', 'desc');
                    break;
            }

            $listings = $query->paginate($request->input('per_page', 12));

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

    // Create announcement (handles both donation and sale)
    public function store(Request $request)
    {
        $listingMode = $request->input('listing_mode', 'donate');
        
        $validated = $request->validate([
            'user_id'           => ['required', 'integer', 'exists:users,id'],
            'super_category_id' => ['required', 'integer', 'exists:categories,id'],
            'sub_category_ids'  => ['nullable', 'array'],
            'sub_category_ids.*'=> ['required', 'integer', 'exists:categories,id'],
            'title'           => ['required', 'string', 'max:255'],
            'listing_mode'    => ['required', 'string', 'in:sell,donate'],
            'listing_type'    => ['required', 'string', 'in:single,collection'],
            'size'            => ['nullable', 'string', 'max:255'],
            'sizes'           => ['nullable'],
            'colors'          => ['nullable'],
            'gender'          => ['nullable', 'string', 'max:40'],
            'age_range'       => ['nullable', 'string', 'max:40'],
            'brand'           => ['nullable', 'string', 'max:120'],
            'season'          => ['nullable', 'string', 'max:60'],
            'condition'       => ['nullable', 'string'],
            'description'     => ['nullable', 'string'],
            'price'           => $listingMode === 'sell' ? ['required', 'numeric', 'min:0'] : ['nullable', 'numeric', 'min:0'],
            'currency'        => ['nullable', 'string', 'max:10'],
            'price_negotiable'=> ['nullable', 'boolean'],
            'media_ids'       => ['required', 'array'],
            'media_ids.*'     => ['required', 'integer', 'exists:media,id'],
            'pickup_address'  => ['nullable', 'string', 'max:255'],
            'handover_method' => ['nullable', 'string', 'in:pickup,delivery,both'],
        ]);

        
        // Create product record
        $product = Product::create([
            'user_id'           => $validated['user_id'],
            'super_category_id' => $validated['super_category_id'],
            'listing_mode'      => $validated['listing_mode'],
            'listing_type'    => $validated['listing_type'],
            'title'           => $validated['title'],
            'description'     => $validated['description'] ?? null,
            'price'           => $listingMode === 'sell' ? $validated['price'] : null,
            'currency'        => $validated['currency'] ?? 'MAD',
            'price_negotiable'=> $validated['price_negotiable'] ?? false,
            'pickup_address'  => $validated['pickup_address'] ?? null,
            'handover_method' => $validated['handover_method'] ?? null,
            'status'          => 'active',
            'condition'       => $validated['condition'] ?? null,
            'gender'          => $validated['gender'] ?? null,
            'age_range'       => $validated['age_range'] ?? null,
            'brand'           => $validated['brand'] ?? null,
            'season'          => $validated['season'] ?? null,
            'sizes'           => $this->parseListField($request->input('sizes')),
            'colors'          => $this->parseListField($request->input('colors')),
        ]);

        // Attach sub-categories (optional, multiple)
        $subCategoryIds = $request->input('sub_category_ids', []);
        if (!empty($subCategoryIds)) {
            $product->subCategories()->sync($subCategoryIds);
        }

        // Handle media IDs
        if (!empty($validated['media_ids'])) {
            $this->linkMediaToProduct($validated['media_ids'], $product);
        }

        // Create product items if it's a collection
        if ($validated['listing_type'] === 'collection') {
            $this->createProductItems($request, $product);
        }

        // Return response
        $message = $listingMode === 'sell' ? 'Sale listing created successfully!' : 'Donation submitted successfully!';
        return response()->json([
            'status'       => 'success',
            'message'      => $message,
            'product'      => $product->load(['categories', 'thumbnail', 'gallery']),
        ], 201);
    }

    // Update announcement status
    public function updateStatus(Request $request, $productId)
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:draft,active,reserved,sold,donated,closed'],
        ]);

        $product = Product::findOrFail($productId);
        $product->status = $validated['status'];
        $product->save();

        return response()->json([
            'status' => 'success',
            'message' => "Product status updated to {$validated['status']}.",
            'product' => $product,
        ]);
    }

    // Get user's announcements (both donations and sales)
    public function getUserAnnouncements($userId)
    {
        $products = $this->productService->getUserAnnouncements((int) $userId);

        return response()->json([
            'status'     => 'success',
            'products'   => ProductResource::collection($products),
        ]);
    }

    // Get user's donations only
    public function getUserDonations($userId)
    {
        $products = $this->productService->getUserAnnouncements((int) $userId);
        $donations = $products->where('listing_mode', 'donate');

        return response()->json([
            'status'    => 'success',
            'donations' => ProductResource::collection($donations),
        ]);
    }

    // Get user's sales only
    public function getUserSales($userId)
    {
        $products = $this->productService->getUserAnnouncements((int) $userId);
        $sales = $products->where('listing_mode', 'sell');

        return response()->json([
            'status' => 'success',
            'sales'  => ProductResource::collection($sales),
        ]);
    }

    // Get all active announcements for public viewing
    public function getAllAnnouncements()
    {
        $products = $this->productService->getActiveProducts();

        return response()->json([
            'status'     => 'success',
            'products'   => ProductResource::collection($products)->resolve(),
        ]);
    }

    // Get single announcement
    public function show($id)
    {
        $product = $this->productService->getProductDetails((int) $id);

        return response()->json([
            'status'  => 'success',
            'product' => new ProductResource($product),
        ]);
    }

    // Delete announcement
    public function destroy($id)
    {
        $deleted = $this->productService->deleteAnnouncement((int) $id);

        return response()->json([
            'status'  => $deleted ? 'success' : 'error',
            'message' => $deleted ? 'Announcement deleted successfully.' : 'Failed to delete announcement.',
        ]);
    }

    // Get all announcements by category
    public function getCategoryAnnouncements($categoryId)
    {
        $products = Product::with(['categories', 'thumbnail', 'gallery', 'user'])
            ->whereHas('categories', function ($query) use ($categoryId) {
                $query->where('categories.id', $categoryId);
            })
            ->where('status', 'active')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'status'     => 'success',
            'products'   => $products,
        ]);
    }

    // Get all announcements for admin
    public function getAllAnnouncementsForAdmin()
    {
        $products = Product::with(['superCategory', 'subCategories', 'thumbnail', 'gallery', 'user', 'items'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'status'     => 'success',
            'products'   => ProductResource::collection($products),
        ]);
    }

    private function linkMediaToProduct(array $mediaIds, Product $product)
    {
        // Update media records to link them to the product and mark as permanent
        Media::whereIn('id', $mediaIds)
            ->whereNull('mediable_id') // Only link temporary media
            ->update([
                'mediable_id' => $product->id,
                'mediable_type' => Product::class,
                'is_temporary' => false, // Mark as permanent when linked to announcement
            ]);

        // No need to set thumbnail automatically since collection is set during upload
    }

    private function createProductItems(Request $request, Product $product)
    {
        // This would be used for collections - for now we'll create a basic item
        ProductItem::create([
            'product_id'      => $product->id,
            'item_name'       => $product->title,
            'item_condition'  => $product->condition,
            'item_gender'     => $product->gender,
            'recommended_age' => $product->age_range,
            'item_brand'      => $product->brand,
            'item_material'   => null,
            'item_season'     => $product->season,
            'item_quantity'   => 1,
            'item_sizes'      => $product->sizes,
            'item_colors'     => $product->colors,
        ]);
    }

    private function parseListField($value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map('trim', $value), fn ($entry) => $entry !== ''));
        }

        if (is_string($value) && $value !== '') {
            return array_values(array_filter(array_map('trim', explode(',', $value)), fn ($entry) => $entry !== ''));
        }

        return [];
    }
}
