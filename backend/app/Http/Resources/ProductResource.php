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
            'slug' =>  $this->slug,
            'super_category_id' => $this->super_category_id,
            'listing_mode' => $this->listing_mode,
            'listing_type' => $this->listing_type,
            'title' => $this->title,
            'description' => $this->description,
            'price' => $this->price,
            'currency' => $this->currency,
            'price_negotiable' => (bool) $this->price_negotiable,
            'pickup_address' => $this->address?->address_line,
            'city'           => $this->address?->city,
            'district'       => $this->address?->district,
            'place_id'       => $this->address?->place_id,
            'country_id'     => $this->address?->country_id,
            'country'        => $this->address?->country ? [
                'id'        => $this->address->country->id,
                'name'      => $this->address->country->name,
                'code'      => $this->address->country->code,
                'flag'      => $this->address->country->flag,
                'dial_code' => $this->address->country->dial_code,
            ] : null,
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
            'is_favorited' => $this->when($request->has('user_id'), function() use ($request) {
                return $this->favorites()->where('user_id', $request->input('user_id'))->exists();
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'user' => $this->whenLoaded('user'),
            'super_category' => $this->whenLoaded('superCategory'),
            'sub_categories' => $this->whenLoaded('subCategories') ?: $this->whenLoaded('categories'),
            'categories' => $this->whenLoaded('categories') ?: $this->whenLoaded('subCategories'), // for backward compatibility
            'thumbnail' => new MediaResource($this->whenLoaded('thumbnail')),
            'gallery' => MediaResource::collection($this->whenLoaded('gallery')),
            'items' => $this->whenLoaded('items'),
            'address' => $this->whenLoaded('address'),
        ];
    }
}
