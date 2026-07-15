<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Models\UserFavorite;
use App\Models\UserSavedItem;
use App\Services\Commerce\SavedDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedDataController extends Controller
{
    public function favorites(Request $request): JsonResponse { return response()->json(['data' => $request->user()->favorites()->with(['product.category', 'product.primaryMedia'])->latest()->get()->map(fn ($favorite) => ['product_uuid' => $favorite->product?->uuid, 'product_slug' => $favorite->product?->slug, 'product_name' => $favorite->product?->name, 'available' => $favorite->product?->status === 'published', 'created_at' => $favorite->created_at?->toIso8601String()])]); }
    public function favorite(Request $request, SavedDataService $service): JsonResponse { $data = $request->validate(['product_uuid' => ['required', 'uuid']]); $service->favorite($request->user(), $data['product_uuid']); return response()->json(['message' => 'Favorite saved.'], 201); }
    public function removeFavorite(Request $request, string $product): JsonResponse { $request->user()->favorites()->whereHas('product', fn ($q) => $q->where('uuid', $product))->delete(); return response()->json(['message' => 'Favorite removed.']); }
    public function savedItems(Request $request): JsonResponse { return response()->json(['data' => $request->user()->savedItems()->with(['variant.product.primaryMedia', 'variant.inventory'])->latest()->get()->map(fn ($item) => ['variant_uuid' => $item->variant?->uuid, 'product_uuid' => $item->variant?->product?->uuid, 'product_slug' => $item->variant?->product?->slug, 'product_name' => $item->variant?->product?->name, 'variant_title' => $item->variant?->title, 'quantity' => $item->quantity, 'price' => $item->variant?->price_amount, 'available' => (bool) ($item->variant?->is_active && $item->variant?->product?->status === 'published'), 'created_at' => $item->created_at?->toIso8601String()])]); }
    public function save(Request $request, SavedDataService $service): JsonResponse { $data = $request->validate(['variant_uuid' => ['required', 'uuid'], 'quantity' => ['nullable', 'integer', 'min:1', 'max:99']]); $service->saved($request->user(), $data['variant_uuid'], (int) ($data['quantity'] ?? 1)); return response()->json(['message' => 'Saved item stored.'], 201); }
    public function removeSaved(Request $request, string $variant): JsonResponse { $request->user()->savedItems()->whereHas('variant', fn ($q) => $q->where('uuid', $variant))->delete(); return response()->json(['message' => 'Saved item removed.']); }
    public function merge(Request $request, SavedDataService $service): JsonResponse { $data = $request->validate(['product_uuids' => ['array', 'max:100'], 'product_uuids.*' => ['uuid'], 'variant_uuids' => ['array', 'max:100'], 'variant_uuids.*' => ['uuid']]); return response()->json($service->merge($request->user(), $data['product_uuids'] ?? [], $data['variant_uuids'] ?? [])); }
    public function moveToCart(Request $request, string $variant, SavedDataService $service): JsonResponse { return response()->json($service->moveToCart($request->user(), $variant, app(\App\Services\Commerce\CartService::class))); }
}
