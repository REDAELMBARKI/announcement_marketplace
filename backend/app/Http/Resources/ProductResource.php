<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'super_category_id' => $this->super_category_id,
            'listing_mode' => $this->listing_mode,
            'listing_type' => $this->listing_type,
            'title' => $this->title,
            'description' => $this->description,
            'price' => $this->price,
            'currency' => $this->currency,
            'price_negotiable' => (bool) $this->price_negotiable,
            'pickup_address' => $this->pickup_address,
            'contact_phone' => $this->contact_phone,
            'handover_method' => $this->handover_method,
            'status' => $this->status,
            'condition' => $this->condition,
            'gender' => $this->gender,
            'age_range' => $this->age_range,
            'brand' => $this->brand,
            'season' => $this->season,
            'sizes' => $this->sizes,
            'colors' => $this->colors,
            'views_count' => $this->views_count,
            'favorites_count' => $this->favorites_count,
            'is_favorited' => $this->favorites()->where('user_id', $request->input('user_id') ?? 1)->exists(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'user' => $this->whenLoaded('user'),
            'super_category' => $this->whenLoaded('superCategory'),
            'sub_categories' => $this->whenLoaded('subCategories'),
            'categories' => $this->whenLoaded('subCategories'), // for backward compatibility
            'thumbnail' => new MediaResource($this->whenLoaded('thumbnail')),
            'gallery' => MediaResource::collection($this->whenLoaded('gallery')),
            'items' => $this->whenLoaded('items'),
            'addresses' => $this->whenLoaded('addresses'),
        ];
    }
}
