<?php

namespace App\Http\Controllers\Api\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\Commerce\ReviewService;
use App\Support\ReviewPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate(['sort' => ['nullable', 'in:recent,highest,lowest'], 'verified' => ['nullable', 'boolean'], 'photos' => ['nullable', 'boolean'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:50']]);
        $query = $product->reviews()->published()->with(['product', 'user', 'media'])->withCount('votes');
        if (($data['verified'] ?? false)) { $query->where('verified_purchase', true); }
        if (($data['photos'] ?? false)) { $query->has('media'); }
        $query = match ($data['sort'] ?? 'recent') { 'highest' => $query->orderByDesc('rating'), 'lowest' => $query->orderBy('rating'), default => $query->latest() };
        $page = $query->paginate($data['per_page'] ?? 10);
        return response()->json(['data' => $page->getCollection()->map(fn ($review) => ReviewPresenter::make($review)), 'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()], 'summary' => app(ReviewService::class)->summary($product)]);
    }
    public function summary(Product $product, ReviewService $service): JsonResponse { return response()->json(['summary' => $service->summary($product)]); }
}
