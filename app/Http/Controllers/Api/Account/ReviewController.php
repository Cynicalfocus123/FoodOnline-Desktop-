<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductReview;
use App\Services\Commerce\ReviewService;
use App\Support\ReviewPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse { return response()->json(['data' => $request->user()->reviews()->with(['product', 'media.upload'])->withCount('votes')->latest()->get()->map(fn ($review) => ReviewPresenter::make($review))]); }
    public function store(Request $request, Product $product, ReviewService $service): JsonResponse { $data = $request->validate(['rating' => ['required', 'integer', 'min:1', 'max:5'], 'title' => ['nullable', 'string', 'max:180'], 'body' => ['nullable', 'string', 'max:5000'], 'product_variant_uuid' => ['nullable', 'uuid'], 'order_item_uuid' => ['nullable', 'uuid']]); return response()->json(['review' => ReviewPresenter::make($service->create($request->user(), $product, $data))], 201); }
    public function update(Request $request, ProductReview $review, ReviewService $service): JsonResponse { $data = $request->validate(['rating' => ['required', 'integer', 'min:1', 'max:5'], 'title' => ['nullable', 'string', 'max:180'], 'body' => ['nullable', 'string', 'max:5000']]); return response()->json(['review' => ReviewPresenter::make($service->update($request->user(), $review, $data))]); }
    public function destroy(Request $request, ProductReview $review, ReviewService $service): JsonResponse { $service->delete($request->user(), $review); return response()->json(['message' => 'Review deleted.']); }
}
