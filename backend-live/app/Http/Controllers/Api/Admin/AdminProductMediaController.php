<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Product\ReorderProductMediaRequest;
use App\Http\Requests\Admin\Product\StoreProductMediaRequest;
use App\Http\Requests\Admin\Product\UpdateProductMediaRequest;
use App\Http\Resources\Admin\AdminProductMediaResource;
use App\Models\Product;
use App\Models\ProductMedia;
use App\Services\Catalog\ProductMediaService;
use Illuminate\Http\JsonResponse;

class AdminProductMediaController extends Controller
{
    public function __construct(private readonly ProductMediaService $media) {}
    public function index(Product $product) { return AdminProductMediaResource::collection($product->media()->ordered()->get()); }
    public function store(StoreProductMediaRequest $request,Product $product): JsonResponse { return (new AdminProductMediaResource($this->media->create($product,$request->validated())))->response()->setStatusCode(201); }
    public function update(UpdateProductMediaRequest $request,ProductMedia $media): AdminProductMediaResource { return new AdminProductMediaResource($this->media->update($media,$request->validated())); }
    public function destroy(ProductMedia $media): JsonResponse { $this->media->delete($media); return response()->json(null,204); }
    public function makePrimary(ProductMedia $media): AdminProductMediaResource { return new AdminProductMediaResource($this->media->makePrimary($media)); }
    public function reorder(ReorderProductMediaRequest $request,Product $product): JsonResponse { $this->media->reorder($product,$request->validated('media_ids')); return response()->json(['message'=>'Product media reordered.']); }
}
