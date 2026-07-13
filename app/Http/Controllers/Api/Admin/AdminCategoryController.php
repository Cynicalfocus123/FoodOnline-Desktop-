<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Category\DeleteCategoryRequest;
use App\Http\Requests\Admin\Category\ReorderCategoriesRequest;
use App\Http\Requests\Admin\Category\StoreCategoryRequest;
use App\Http\Requests\Admin\Category\UpdateCategoryRequest;
use App\Http\Resources\Admin\AdminCategoryResource;
use App\Models\Category;
use App\Services\Catalog\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminCategoryController extends Controller
{
    public function __construct(private readonly CategoryService $categories) {}

    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['sometimes', 'string', 'max:160'],
            'status' => ['sometimes', Rule::in(Category::STATUSES)],
            'visibility' => ['sometimes', Rule::in(Category::VISIBILITIES)],
            'parent_id' => ['sometimes', 'nullable', 'integer'],
            'root_only' => ['sometimes', 'boolean'],
            'featured' => ['sometimes', 'boolean'],
            'navigation' => ['sometimes', 'boolean'],
            'homepage' => ['sometimes', 'boolean'],
            'with_trashed' => ['sometimes', 'boolean'],
            'sort' => ['sometimes', Rule::in(['sort_order', 'name', 'created_at', 'updated_at'])],
            'direction' => ['sometimes', Rule::in(['asc', 'desc'])],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);
        $query = Category::query()->with(['parent', 'aliases']);
        if ($request->boolean('with_trashed')) { $query->withTrashed(); }
        if (isset($filters['search'])) { $query->where(fn ($q) => $q->where('name', 'like', '%'.$filters['search'].'%')->orWhere('slug', 'like', '%'.$filters['search'].'%')); }
        foreach (['status', 'visibility', 'parent_id'] as $field) { if (array_key_exists($field, $filters)) { $query->where($field, $filters[$field]); } }
        if ($request->boolean('root_only')) { $query->roots(); }
        if ($request->boolean('featured')) { $query->where('is_featured', true); }
        if ($request->boolean('navigation')) { $query->where('show_in_navigation', true); }
        if ($request->boolean('homepage')) { $query->where('show_on_homepage', true); }
        $query->orderBy($filters['sort'] ?? 'sort_order', $filters['direction'] ?? 'asc')->orderBy('id');

        return AdminCategoryResource::collection($query->paginate((int) ($filters['per_page'] ?? 25))->withQueryString());
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categories->create($request->validated(), $request->user());
        return (new AdminCategoryResource($category->load(['parent', 'aliases'])))->response()->setStatusCode(201);
    }

    public function show(Category $category): AdminCategoryResource { return new AdminCategoryResource($category->load(['parent', 'aliases'])); }

    public function update(UpdateCategoryRequest $request, Category $category): AdminCategoryResource
    {
        return new AdminCategoryResource($this->categories->update($category, $request->validated(), $request->user())->load(['parent', 'aliases']));
    }

    public function destroy(DeleteCategoryRequest $request, Category $category): JsonResponse
    {
        $this->categories->permanentlyDelete($category, (string) $request->validated('confirm_slug'));
        return response()->json(null, 204);
    }

    public function archive(Request $request, Category $category): AdminCategoryResource
    {
        return new AdminCategoryResource($this->categories->archive($category, $request->user())->load(['parent', 'aliases']));
    }

    public function restore(Request $request, Category $category): AdminCategoryResource
    {
        return new AdminCategoryResource($this->categories->restore($category, $request->user())->load(['parent', 'aliases']));
    }

    public function reorder(ReorderCategoriesRequest $request): JsonResponse
    {
        $data = $request->validated();
        $this->categories->reorder($data['parent_id'] ?? null, $data['category_ids'], $request->user());
        return response()->json(['message' => 'Categories reordered.']);
    }
}
