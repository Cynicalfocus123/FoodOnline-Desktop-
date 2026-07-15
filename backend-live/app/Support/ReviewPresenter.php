<?php

namespace App\Support;

use App\Models\ProductReview;

final class ReviewPresenter
{
    public static function make(ProductReview $review): array
    {
        return ['uuid' => $review->uuid, 'product_uuid' => $review->product?->uuid, 'product_name' => $review->product?->name, 'customer_name' => $review->user?->first_name ? trim($review->user->first_name.' '.($review->user->last_name ?? '')) : 'Customer', 'rating' => (int) $review->rating, 'title' => $review->title, 'body' => $review->body, 'status' => $review->status, 'verified_purchase' => (bool) $review->verified_purchase, 'helpful_count' => $review->votes_count ?? $review->votes()->count(), 'reported' => (bool) ($review->reported_by_current_user ?? false), 'images' => $review->media->map(fn ($media) => ['uuid' => $media->uuid, 'url' => app(\App\Services\Catalog\CategoryMediaUrl::class)->make($media->path), 'alt_text' => $media->alt_text])->values(), 'created_at' => $review->created_at?->toIso8601String(), 'edited_at' => $review->edited_at?->toIso8601String()];
    }
}
