<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Category\StoreCategoryAliasRequest;
use App\Http\Resources\Admin\CategoryAliasResource;
use App\Models\Category;
use App\Models\CategoryAlias;
use App\Services\Catalog\CategoryService;
use Illuminate\Http\JsonResponse;

class AdminCategoryAliasController extends Controller
{
    public function __construct(private readonly CategoryService $categories) {}

    public function index(Category $category)
    {
        return CategoryAliasResource::collection($category->aliases()->orderBy('alias_slug')->get());
    }

    public function store(StoreCategoryAliasRequest $request, Category $category): JsonResponse
    {
        $alias = $this->categories->addAlias($category, $request->validated(), $request->user());
        return (new CategoryAliasResource($alias))->response()->setStatusCode(201);
    }

    public function destroy(CategoryAlias $alias): JsonResponse
    {
        $this->categories->removeAlias($alias);
        return response()->json(null, 204);
    }
}
