<?php

namespace App\Services\Commerce;

use App\Models\Product;
use App\Models\ProductReview;
use App\Models\ReviewHelpfulVote;
use App\Models\ReviewReport;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Notifications\CommerceNotification;

class ReviewService
{
    public function create(User $user, Product $product, array $data): ProductReview
    {
        $product->load('variants');
        if ($product->status !== 'published' && ! $this->hasQualifyingOrder($user, $product)) { throw (new ModelNotFoundException)->setModel(Product::class); }
        if (ProductReview::query()->where('user_id', $user->id)->where('product_id', $product->id)->exists()) { throw ValidationException::withMessages(['review' => ['You already reviewed this product. Edit your existing review instead.']]); }
        [$verified, $order, $orderItem] = $this->qualifyingPurchase($user, $product, $data['order_item_uuid'] ?? null);
        if (! $verified) { throw ValidationException::withMessages(['review' => ['A delivered purchase is required before reviewing this product.']]); }
        return ProductReview::query()->create([
            'uuid' => (string) Str::uuid(), 'product_id' => $product->id, 'product_variant_id' => ! empty($data['product_variant_uuid']) ? $product->variants->firstWhere('uuid', $data['product_variant_uuid'])?->id : $orderItem?->product_variant_id,
            'user_id' => $user->id, 'order_id' => $order?->id, 'order_item_id' => $orderItem?->id, 'rating' => (int) $data['rating'], 'title' => $data['title'] ?? null,
            'body' => $data['body'] ?? null, 'status' => 'pending', 'verified_purchase' => $verified,
        ])->load(['product', 'user', 'media']);
    }

    public function update(User $user, ProductReview $review, array $data): ProductReview
    {
        if ($review->user_id !== $user->id) { throw (new ModelNotFoundException)->setModel(ProductReview::class); }
        $review->fill(['rating' => (int) $data['rating'], 'title' => $data['title'] ?? null, 'body' => $data['body'] ?? null, 'status' => $review->status === 'published' ? 'pending' : $review->status, 'edited_at' => now()])->save();
        return $review->fresh(['product', 'user', 'media']);
    }

    public function delete(User $user, ProductReview $review): void
    {
        if ($review->user_id !== $user->id) { throw (new ModelNotFoundException)->setModel(ProductReview::class); }
        $review->delete();
    }

    public function helpful(User $user, ProductReview $review, bool $remove = false): void
    {
        if ($remove) { $review->votes()->where('user_id', $user->id)->delete(); return; }
        ReviewHelpfulVote::query()->firstOrCreate(['product_review_id' => $review->id, 'user_id' => $user->id]);
    }

    public function report(User $user, ProductReview $review, array $data): ReviewReport
    {
        $report = ReviewReport::query()->firstOrCreate(['product_review_id' => $review->id, 'user_id' => $user->id], ['uuid' => (string) Str::uuid(), 'reason_code' => $data['reason_code'], 'details' => $data['details'] ?? null]);
        User::query()->where('role', 'admin')->where('status', 'active')->get()->each(fn (User $admin) => $admin->notify(new CommerceNotification('reported_review', 'Review reported', 'A customer review needs moderation.', ['type' => 'review', 'uuid' => $review->uuid])));
        return $report;
    }

    public function summary(Product $product): array
    {
        $query = $product->reviews()->published();
        $counts = $query->select('rating', DB::raw('count(*) as count'))->groupBy('rating')->pluck('count', 'rating');
        $count = (int) $query->count();
        $average = $count ? round((float) $query->avg('rating'), 2) : 0;
        return ['average_rating' => $average, 'review_count' => $count, 'breakdown' => collect([1, 2, 3, 4, 5])->mapWithKeys(fn (int $rating) => [$rating => (int) ($counts[$rating] ?? 0)])->all()];
    }

    private function qualifyingPurchase(User $user, Product $product, ?string $itemUuid): array
    {
        $items = $user->orders()->whereIn('fulfillment_status', ['delivered'])->whereHas('items', fn ($q) => $q->where('product_id', $product->id))->with('items')->get()->flatMap->items;
        $item = $itemUuid ? $items->firstWhere('uuid', $itemUuid) : $items->first();
        return [(bool) $item, $item?->order, $item];
    }

    private function hasQualifyingOrder(User $user, Product $product): bool { return $user->orders()->whereIn('fulfillment_status', ['delivered'])->whereHas('items', fn ($q) => $q->where('product_id', $product->id))->exists(); }
}
