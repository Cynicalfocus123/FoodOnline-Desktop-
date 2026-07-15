<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use App\Models\ProductVariant;
use App\Services\Catalog\CategoryMediaUrl;
use App\Services\Commerce\InventoryService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminInventoryController extends Controller
{
    public function __construct(private readonly CategoryMediaUrl $mediaUrl) {}

    public function index(Request $request): JsonResponse
    {
        $values = $request->validate(['search' => ['nullable', 'string', 'max:100'], 'low_stock' => ['nullable', 'boolean'], 'out_of_stock' => ['nullable', 'boolean'],
            'tracking_enabled' => ['nullable', 'boolean'], 'category_id' => ['nullable', 'integer'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]);
        $query = ProductVariant::query()->with(['product.category', 'product.primaryMedia', 'inventory'])->whereHas('product');
        if ($search = $values['search'] ?? null) { $query->where(fn (Builder $q) => $q->where('sku', 'like', "%{$search}%")->orWhere('title', 'like', "%{$search}%")->orWhereHas('product', fn ($p) => $p->where('name', 'like', "%{$search}%"))); }
        if (isset($values['category_id'])) { $query->whereHas('product', fn ($p) => $p->where('category_id', $values['category_id'])); }
        if (array_key_exists('tracking_enabled', $values)) { $query->whereHas('inventory', fn ($q) => $q->where('tracking_enabled', $values['tracking_enabled'])); }
        if ($values['low_stock'] ?? false) { $query->whereHas('inventory', fn ($q) => $q->where('tracking_enabled', true)->whereRaw('(quantity_on_hand - quantity_reserved) <= low_stock_threshold')); }
        if ($values['out_of_stock'] ?? false) { $query->whereHas('inventory', fn ($q) => $q->where('tracking_enabled', true)->whereColumn('quantity_on_hand', '<=', 'quantity_reserved')); }
        $page = $query->orderBy('sku')->paginate($values['per_page'] ?? 25);
        return response()->json(['data' => $page->getCollection()->map(fn ($variant) => $this->payload($variant)),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()]]);
    }

    public function adjust(Request $request, ProductVariant $variant, InventoryService $service): JsonResponse
    {
        $values = $request->validate(['quantity_delta' => ['required', 'integer'], 'reason' => ['required', 'string', 'min:3', 'max:255'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'], 'tracking_enabled' => ['nullable', 'boolean'], 'allow_backorder' => ['nullable', 'boolean']]);
        $inventory = $service->adjust($variant, $values, $request->user(), $request);
        return response()->json(['inventory' => $this->payload($inventory->variant)]);
    }

    public function history(ProductVariant $variant): JsonResponse
    {
        $movements = InventoryMovement::query()->where('product_variant_id', $variant->id)->latest('created_at')->limit(200)->get();
        return response()->json(['data' => $movements->map(fn ($movement) => $movement->only(['uuid', 'movement_type', 'quantity_delta', 'quantity_before', 'quantity_after', 'reserved_before', 'reserved_after', 'reason', 'metadata', 'created_at']))]);
    }

    private function payload(ProductVariant $variant): array
    {
        $variant->loadMissing(['product.category', 'product.primaryMedia', 'inventory']); $inventory = $variant->inventory;
        return ['variant_uuid' => $variant->uuid, 'product_uuid' => $variant->product?->uuid, 'product_name' => $variant->product?->name,
            'product_slug' => $variant->product?->slug, 'product_image_url' => $this->mediaUrl->make($variant->product?->primaryMedia?->path),
            'category' => $variant->product?->category?->name, 'variant_title' => $variant->title, 'sku' => $variant->sku, 'gtin' => $variant->gtin,
            'quantity_on_hand' => $inventory?->quantity_on_hand ?? 0, 'quantity_reserved' => $inventory?->quantity_reserved ?? 0,
            'available_quantity' => $inventory?->availableQuantity() ?? null, 'low_stock_threshold' => $inventory?->low_stock_threshold ?? 5,
            'tracking_enabled' => $inventory?->tracking_enabled ?? false, 'allow_backorder' => $inventory?->allow_backorder ?? false,
            'availability_status' => $variant->availability_status, 'updated_at' => ($inventory?->updated_at ?? $variant->updated_at)?->toIso8601String()];
    }
}
