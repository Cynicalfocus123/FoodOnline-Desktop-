<?php

namespace App\Http\Controllers\Api\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Resources\Catalog\CategoryCollection;
use App\Http\Resources\Catalog\CategoryResource;
use App\Http\Resources\Catalog\CategoryTreeResource;
use App\Models\Category;
use App\Models\CategoryAlias;
use App\Services\Catalog\CategoryCache;
use App\Services\Catalog\CategoryHierarchyService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryCache $cache,
        private readonly CategoryHierarchyService $hierarchy,
    ) {}

    public function index(Request $request): CategoryCollection
    {
        $filters = $request->validate([
            'parent' => ['sometimes', 'string', 'max:160'],
            'root_only' => ['sometimes', 'boolean'],
            'navigation' => ['sometimes', 'boolean'],
            'homepage' => ['sometimes', 'boolean'],
            'featured' => ['sometimes', 'boolean'],
            'include_children' => ['sometimes', 'boolean'],
            'status' => ['sometimes', Rule::in(['published'])],
            'sort' => ['sometimes', Rule::in(['sort_order', 'name', 'newest'])],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Category::query()->published()->visible();
        if ($request->boolean('root_only')) {
            $query->roots();
        } elseif (isset($filters['parent'])) {
            $parent = Category::query()->published()->where('slug', $filters['parent'])->firstOrFail();
            $query->where('parent_id', $parent->id);
        }
        if ($request->boolean('navigation')) { $query->navigation(); }
        if ($request->boolean('homepage')) { $query->homepage(); }
        if ($request->boolean('featured')) { $query->where('is_featured', true); }
        if ($request->boolean('include_children')) { $query->with('activeChildren'); }
        $this->applySort($query, $filters['sort'] ?? 'sort_order');

        return new CategoryCollection($query->paginate((int) ($filters['per_page'] ?? 24))->withQueryString());
    }

    public function tree(): JsonResponse
    {
        $roots = Cache::remember($this->cache->key('tree'), now()->addMinutes(5), function (): Collection {
            $categories = Category::query()->published()->visible()->ordered()->get();
            $byParent = $categories->groupBy(fn (Category $category) => $category->parent_id ?? 'root');
            $attach = function (Category $category, int $depth = 0) use (&$attach, $byParent): Category {
                $children = $depth >= Category::MAX_DEPTH ? collect() : ($byParent->get($category->id) ?? collect());
                $category->setRelation('treeChildren', $children->map(fn (Category $child) => $attach($child, $depth + 1)));
                return $category;
            };

            return ($byParent->get('root') ?? collect())->map(fn (Category $root) => $attach($root));
        });

        return response()->json(['data' => CategoryTreeResource::collection($roots)->resolve()]);
    }

    public function show(string $category): JsonResponse
    {
        $resolved = Cache::remember($this->cache->key('lookup:'.$category), now()->addMinutes(5), function () use ($category): array {
            $canonical = Category::query()->published()->whereIn('visibility', ['public', 'catalog_only'])->where('slug', $category)->first();
            $alias = null;
            if (! $canonical) {
                $alias = CategoryAlias::query()->where('alias_slug', $category)->where('is_active', true)->first();
                $canonical = $alias?->category()->published()->whereIn('visibility', ['public', 'catalog_only'])->first();
            }
            abort_unless($canonical, 404);
            $canonical->load(['activeChildren', 'parent']);

            return ['category' => $canonical, 'alias' => $alias];
        });

        return response()->json([
            'data' => (new CategoryResource($resolved['category']))->resolve(),
            'breadcrumbs' => $this->hierarchy->breadcrumbs($resolved['category']),
            'meta' => [
                'resolved_from_alias' => $resolved['alias']?->alias_slug,
                'redirect_code' => $resolved['alias']?->redirect_code,
            ],
        ]);
    }

    private function applySort(Builder $query, string $sort): void
    {
        match ($sort) {
            'name' => $query->orderBy('name')->orderBy('id'),
            'newest' => $query->orderByDesc('published_at')->orderBy('id'),
            default => $query->ordered(),
        };
    }
}
