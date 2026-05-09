<?php

namespace App\Repositories;

use App\Models\Offer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class OfferRepository
{
    /**
     * Get all offers for a product.
     *
     * @param Product $product
     * @return Collection
     */
    public function getOffersForProduct(Product $product): Collection
    {
        return $product->offers()
            ->with(['buyer:id,name,avatar'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get pending offers for a seller.
     *
     * @param int $sellerId
     * @return Collection
     */
    public function getPendingOffersForSeller(int $sellerId): Collection
    {
        return Offer::where('seller_id', $sellerId)
            ->where('status', 'pending')
            ->with(['product:id,title,slug,thumbnail', 'buyer:id,name,avatar'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get offers made by a buyer.
     *
     * @param int $buyerId
     * @return Collection
     */
    public function getOffersByBuyer(int $buyerId): Collection
    {
        return Offer::where('buyer_id', $buyerId)
            ->with(['product:id,title,slug,thumbnail', 'seller:id,name,avatar'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Check if buyer has pending offer on product.
     *
     * @param int $productId
     * @param int $buyerId
     * @return bool
     */
    public function hasPendingOffer(int $productId, int $buyerId): bool
    {
        return Offer::where('product_id', $productId)
            ->where('buyer_id', $buyerId)
            ->where('status', 'pending')
            ->exists();
    }

    /**
     * Create a new offer.
     *
     * @param array $data
     * @return Offer
     */
    public function create(array $data): Offer
    {
        return Offer::create($data);
    }

    /**
     * Find offer by ID.
     *
     * @param int $offerId
     * @return Offer|null
     */
    public function findById(int $offerId): ?Offer
    {
        return Offer::with(['product', 'buyer', 'seller'])->find($offerId);
    }

    /**
     * Update offer status.
     *
     * @param Offer $offer
     * @param string $status
     * @param array $additionalData
     * @return Offer
     */
    public function updateStatus(Offer $offer, string $status, array $additionalData = []): Offer
    {
        $updateData = array_merge(
            ['status' => $status, 'responded_at' => now()],
            $additionalData
        );

        $offer->update($updateData);
        return $offer->fresh();
    }

    /**
     * Get active offer for product by buyer.
     *
     * @param int $productId
     * @param int $buyerId
     * @return Offer|null
     */
    public function getActiveOffer(int $productId, int $buyerId): ?Offer
    {
        return Offer::where('product_id', $productId)
            ->where('buyer_id', $buyerId)
            ->whereIn('status', ['pending', 'countered'])
            ->first();
    }
}
