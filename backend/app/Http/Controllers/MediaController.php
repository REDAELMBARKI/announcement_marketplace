<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class MediaController extends Controller
{
    /**
     * Upload a single image (temporary).
     */
    public function upload(Request $request)
    {
        Log::info('[MediaController@upload] Initiating upload process', [
            'user_id' => Auth::id(),
            'has_file' => $request->hasFile('image'),
            'collection' => $request->input('collection'),
            'mediable_type' => $request->input('mediable_type'),
        ]);

        try {
            $validated = $request->validate([
                'image' => ['required', 'image', 'max:8192'], // Max 8MB
                'collection' => ['nullable', 'string'],
                'mediable_type' => ['required', 'string', 'in:product,user,category,hero_slider,banner'],
            ]);

            if (!$request->hasFile('image')) {
                Log::warning('[MediaController@upload] Upload attempt without image file', [
                    'user_id' => Auth::id(),
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'No image file provided.',
                ], 400);
            }

            $image = $request->file('image');
            $collection = $validated['collection'] ?? 'gallery';

            Log::info('[MediaController@upload] Processing file', [
                'original_name' => $image->getClientOriginalName(),
                'mime_type' => $image->getMimeType(),
                'size_bytes' => $image->getSize(),
            ]);
            
            // Store the image in temp_media folder
            $path = $image->store('temp_media', 'public');

            if (!$path) {
                Log::error('[MediaController@upload] Failed to store image on public disk', [
                    'user_id' => Auth::id(),
                    'original_name' => $image->getClientOriginalName(),
                ]);
                throw new \Exception('Failed to store image on disk.');
            }
            
            // Create temporary media record
            $media = Media::create([
                'mediable_id' => null, 
                'mediable_type' => null, 
                'disk' => 'public',
                'path' => $path,
                'url' => Storage::disk('public')->url($path),
                'file_name' => $image->getClientOriginalName(),
                'mime_type' => $image->getMimeType(),
                'size' => $image->getSize(),
                'collection' => $collection,
                'sort_order' => 0,
                'is_temporary' => true, 
            ]);

            Log::info('[MediaController@upload] Image uploaded successfully', [
                'media_id' => $media->id,
                'url' => $media->url,
                'path' => $media->path,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Image uploaded successfully.',
                'id' => $media->id,
                'mediaId' => $media->id,
                'url' => $media->url,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('[MediaController@upload] Validation failed', [
                'errors' => $e->errors(),
                'user_id' => Auth::id(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('[MediaController@upload] Exception during upload', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
            ]);
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
                'url' => Storage::disk('public')->url($path),
                'file_name' => $image->getClientOriginalName(),
                'mime_type' => $image->getMimeType(),
                'size' => $image->getSize(),
                'collection' => 'gallery',
                'sort_order' => $index,
                'is_temporary' => true, 
            ]);

            $uploadedMedia[] = [
                'id' => $media->id,
                'mediaId' => $media->id,
                'url' => $media->url,
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
            
            if ($media->is_temporary && str_starts_with($media->path, 'temp_media/')) {
                $oldPath = $media->path;
                $newPath = 'products/' . basename($oldPath);

                if (Storage::disk($media->disk)->exists($oldPath)) {
                    Storage::disk($media->disk)->move($oldPath, $newPath);
                    
                    $media->update([
                        'mediable_id' => $product->id,
                        'mediable_type' => Product::class,
                        'is_temporary' => false,
                        'path' => $newPath,
                        'url' => Storage::disk($media->disk)->url($newPath),
                    ]);
                    continue;
                }
            }

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
