<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Product\ReorderProductVariantsRequest;
use App\Http\Requests\Admin\Product\StoreProductVariantRequest;
use App\Http\Requests\Admin\Product\UpdateProductVariantRequest;
use App\Http\Resources\Admin\AdminProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Catalog\ProductVariantService;
use Illuminate\Http\JsonResponse;

class AdminProductVariantController extends Controller
{
    public function __construct(private readonly ProductVariantService $variants) {}
    public function index(Product $product) { return AdminProductVariantResource::collection($product->variants()->ordered()->get()); }
    public function store(StoreProductVariantRequest $request,Product $product): JsonResponse { return (new AdminProductVariantResource($this->variants->create($product,$request->validated())))->response()->setStatusCode(201); }
    public function update(UpdateProductVariantRequest $request,ProductVariant $variant): AdminProductVariantResource { return new AdminProductVariantResource($this->variants->update($variant,$request->validated())); }
    public function destroy(ProductVariant $variant): JsonResponse { $this->variants->deactivate($variant); return response()->json(null,204); }
    public function makeDefault(ProductVariant $variant): AdminProductVariantResource { return new AdminProductVariantResource($this->variants->makeDefault($variant)); }
    public function reorder(ReorderProductVariantsRequest $request,Product $product): JsonResponse { $this->variants->reorder($product,$request->validated('variant_ids')); return response()->json(['message'=>'Product variants reordered.']); }
}
