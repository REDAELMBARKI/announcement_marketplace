<?php

namespace App\Services;

use App\Models\Offer;
use App\Models\Product;
use App\Models\User;
use App\Repositories\OfferRepository;
use Illuminate\Database\Eloquent\Collection;

class OfferService
{
    public function __construct(
        protected OfferRepository $offerRepository
    ) {}

    /**
     * Get all offers for a product.
     *
     * @param Product $product
     * @return Collection
     */
    public function getOffersForProduct(Product $product): Collection
    {
        return $this->offerRepository->getOffersForProduct($product);
    }

    /**
     * Create a new offer.
     *
     * @param Product $product
     * @param User $buyer
     * @param float $offerPrice
     * @param string|null $message
     * @return array
     */
    public function makeOffer(Product $product, User $buyer, float $offerPrice, ?string $message = null): array
    {
        // Check if buyer already has pending offer
        if ($this->offerRepository->hasPendingOffer($product->id, $buyer->id)) {
            return [
                'success' => false,
                'message' => 'You already have a pending offer on this item',
            ];
        }

        // Check if price is valid (less than original)
        $originalPrice = $product->price ?? 0;

        $offer = $this->offerRepository->create([
            'product_id' => $product->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $product->user_id,
            'original_price' => $originalPrice,
            'offer_price' => $offerPrice,
            'message' => $message,
            'status' => 'pending',
            'expires_at' => now()->addDays(7), // 7 day expiry
        ]);

        return [
            'success' => true,
            'offer' => $offer->load(['buyer:id,name,avatar']),
            'message' => 'Offer submitted successfully',
        ];
    }

    /**
     * Accept an offer.
     *
     * @param Offer $offer
     * @return array
     */
    public function acceptOffer(Offer $offer): array
    {
        if (!$offer->isActive()) {
            return [
                'success' => false,
                'message' => 'This offer is no longer active',
            ];
        }

        $updatedOffer = $this->offerRepository->updateStatus($offer, 'accepted');

        return [
            'success' => true,
            'offer' => $updatedOffer,
            'message' => 'Offer accepted! Buyer has been notified.',
        ];
    }

    /**
     * Reject an offer.
     *
     * @param Offer $offer
     * @return array
     */
    public function rejectOffer(Offer $offer): array
    {
        if (!$offer->isActive()) {
            return [
                'success' => false,
                'message' => 'This offer is no longer active',
            ];
        }

        $updatedOffer = $this->offerRepository->updateStatus($offer, 'rejected');

        return [
            'success' => true,
            'offer' => $updatedOffer,
            'message' => 'Offer rejected',
        ];
    }

    /**
     * Counter an offer with new price.
     *
     * @param Offer $offer
     * @param float $counterPrice
     * @return array
     */
    public function counterOffer(Offer $offer, float $counterPrice): array
    {
        if (!$offer->isActive()) {
            return [
                'success' => false,
                'message' => 'This offer is no longer active',
            ];
        }

        $updatedOffer = $this->offerRepository->updateStatus($offer, 'countered', [
            'counter_price' => $counterPrice,
        ]);

        return [
            'success' => true,
            'offer' => $updatedOffer,
            'message' => 'Counter offer sent!',
        ];
    }

    /**
     * Accept counter offer (buyer accepts seller's counter).
     *
     * @param Offer $offer
     * @return array
     */
    public function acceptCounter(Offer $offer): array
    {
        if ($offer->status !== 'countered') {
            return [
                'success' => false,
                'message' => 'No counter offer to accept',
            ];
        }

        $updatedOffer = $this->offerRepository->updateStatus($offer, 'accepted');

        return [
            'success' => true,
            'offer' => $updatedOffer,
            'message' => 'Counter offer accepted! Deal confirmed at counter price.',
        ];
    }

    /**
     * Get seller's pending offers.
     *
     * @param int $sellerId
     * @return Collection
     */
    public function getSellerPendingOffers(int $sellerId): Collection
    {
        return $this->offerRepository->getPendingOffersForSeller($sellerId);
    }

    /**
     * Get buyer's offer history.
     *
     * @param int $buyerId
     * @return Collection
     */
    public function getBuyerOffers(int $buyerId): Collection
    {
        return $this->offerRepository->getOffersByBuyer($buyerId);
    }

    /**
     * Expire old offers.
     * Can be run via scheduled command.
     *
     * @return int Count of expired offers
     */
    public function expireOldOffers(): int
    {
        $expiredOffers = Offer::where('status', 'pending')
            ->where('expires_at', '<', now())
            ->get();

        foreach ($expiredOffers as $offer) {
            $offer->markExpired();
        }

        return $expiredOffers->count();
    }
}
