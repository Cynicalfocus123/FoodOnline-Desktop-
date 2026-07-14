<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Product\ProductNutritionFactRequest;
use App\Http\Resources\Admin\AdminProductNutritionFactResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class AdminProductNutritionFactController extends Controller
{
    public function show(Product $product): JsonResponse
    {
        return response()->json(['data' => $product->nutritionFacts ? (new AdminProductNutritionFactResource($product->nutritionFacts))->resolve() : null]);
    }

    public function update(ProductNutritionFactRequest $request, Product $product): AdminProductNutritionFactResource
    {
        return new AdminProductNutritionFactResource($product->nutritionFacts()->updateOrCreate([], $request->validated())->fresh());
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->nutritionFacts()->delete();
        return response()->json(null, 204);
    }
}
