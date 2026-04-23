<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    /**
     * Upload a single image (temporary).
     */
    public function upload(Request $request)
    {
        try {
            $validated = $request->validate([
                'image' => ['required', 'image', 'max:4096'],
                'collection' => ['nullable', 'string', 'in:thumbnail,gallery'],
                'mediable_type' => ['required', 'string', 'in:product,user,category'],
            ]);

            if (!$request->hasFile('image')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No image file provided.',
                ], 400);
            }

            $image = $request->file('image');
            $collection = $validated['collection'] ?? 'gallery';
            
            // Store the image
            $folder = strtolower($validated['mediable_type']) . 's'; // "product" → "products" 
            $path = $image->store($folder, 'public');

            if (!$path) {
                throw new \Exception('Failed to store image on disk.');
            }
            
            // Create temporary media record
            $media = Media::create([
                'mediable_id' => null, 
                'mediable_type' => null, 
                'disk' => 'public',
                'path' => $path,
                'url' => url('storage/' . $path),
                'file_name' => $image->getClientOriginalName(),
                'mime_type' => $image->getMimeType(),
                'size' => $image->getSize(),
                'collection' => $collection,
                'sort_order' => 0,
                'is_temporary' => true, 
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Image uploaded successfully.',
                'mediaId' => $media->id,
                'url' => $media->url,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // Upload multiple images at once
    public function uploadMultiple(Request $request)
    {
        $validated = $request->validate([
            'images' => ['required', 'array', 'max:8'],
            'images.*' => ['required', 'image', 'max:4096'],
        ]);

        if (!$request->hasFile('images')) {
            return response()->json([
                'status' => 'error',
                'message' => 'No image files provided.',
            ], 400);
        }

        $uploadedMedia = [];
        
        foreach ($request->file('images') as $index => $image) {
            $path = $image->store('temp_media', 'public');
            
            $media = Media::create([
                'mediable_id' => null,
                'mediable_type' => null,
                'disk' => 'public',
                'path' => $path,
                'url' => url('storage/' . $path),
                'file_name' => $image->getClientOriginalName(),
                'mime_type' => $image->getMimeType(),
                'size' => $image->getSize(),
                'collection' => 'gallery',
                'sort_order' => $index,
                'is_temporary' => true, // Mark as temporary initially
            ]);

            $uploadedMedia[] = [
                'mediaId' => $media->id,
                'url' => $media->url,
                'fileName' => $media->file_name,
            ];
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Images uploaded successfully.',
            'media' => $uploadedMedia,
        ], 201);
    }

    /**
     * Link temporary media to an announcement (product).
     */
    public function linkToAnnouncement(Request $request)
    {
        $validated = $request->validate([
            'announcement_id' => ['required', 'exists:products,id'],
            'media_ids' => ['required', 'array'],
            'media_ids.*' => ['exists:media,id'],
        ]);

        $product = Product::findOrFail($validated['announcement_id']);

        foreach ($validated['media_ids'] as $mediaId) {
            $media = Media::findOrFail($mediaId);
            $media->update([
                'mediable_id' => $product->id,
                'mediable_type' => Product::class,
                'is_temporary' => false,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Media linked successfully.',
        ]);
    }

    // Delete temporary media
    public function deleteTemporary($mediaId)
    {
        $media = Media::where('id', $mediaId)
            ->where('is_temporary', true) // Only allow deletion of temporary media
            ->first();

        if (!$media) {
            return response()->json([
                'status' => 'error',
                'message' => 'Temporary media not found or already linked.',
            ], 404);
        }

        // Delete file from storage
        if ($media->path) {
            Storage::disk('public')->delete($media->path);
        }

        // Delete media record
        $media->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Temporary media deleted successfully.',
        ]);
    }

    // Clean up old temporary media (can be called by a scheduled job)
    public function cleanupTemporary()
    {
        // Delete temporary media older than 24 hours
        $oldMedia = Media::where('is_temporary', true)
            ->where('created_at', '<', now()->subHours(24))
            ->get();

        foreach ($oldMedia as $media) {
            if ($media->path) {
                Storage::disk('public')->delete($media->path);
            }
            $media->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => "Cleaned up {$oldMedia->count()} old temporary media files.",
        ]);
    }
}
