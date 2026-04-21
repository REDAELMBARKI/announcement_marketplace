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
            'products'   => ProductResource::collection($products),
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
