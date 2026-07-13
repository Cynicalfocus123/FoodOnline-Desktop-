<?php

namespace App\Services\Catalog;

use App\Models\Category;
use Illuminate\Validation\ValidationException;

class CategoryHierarchyService
{
    /** @return array{parent: ?Category, depth: int, path: string} */
    public function metadata(?Category $category, ?int $parentId, string $slug): array
    {
        $parent = $parentId === null ? null : Category::query()->find($parentId);
        if ($parentId !== null && ! $parent) {
            throw ValidationException::withMessages(['parent_id' => ['The selected parent category is invalid.']]);
        }

        if ($category && $parent?->is($category)) {
            throw ValidationException::withMessages(['parent_id' => ['A category cannot be its own parent.']]);
        }

        $cursor = $parent;
        $seen = [];
        while ($cursor) {
            if (isset($seen[$cursor->id]) || ($category && $cursor->is($category))) {
                throw ValidationException::withMessages(['parent_id' => ['The selected parent would create a category cycle.']]);
            }
            $seen[$cursor->id] = true;
            $cursor = $cursor->parent;
        }

        $depth = $parent ? $parent->depth + 1 : 0;
        $relativeSubtreeDepth = $category ? $this->relativeSubtreeDepth($category) : 0;
        if ($depth + $relativeSubtreeDepth > Category::MAX_DEPTH) {
            throw ValidationException::withMessages(['parent_id' => ['Categories support a maximum of four hierarchy levels.']]);
        }

        return [
            'parent' => $parent,
            'depth' => $depth,
            'path' => $parent ? $parent->path.'/'.$slug : $slug,
        ];
    }

    public function rebuildDescendants(Category $category): void
    {
        foreach ($category->children()->get() as $child) {
            $child->forceFill([
                'depth' => $category->depth + 1,
                'path' => $category->path.'/'.$child->slug,
            ])->saveQuietly();
            $this->rebuildDescendants($child);
        }
    }

    /** @return array<int, array{name: string, slug: string}> */
    public function breadcrumbs(Category $category): array
    {
        $crumbs = [];
        $cursor = $category;
        $seen = [];
        while ($cursor && count($crumbs) <= Category::MAX_DEPTH) {
            if (isset($seen[$cursor->id])) {
                break;
            }
            $seen[$cursor->id] = true;
            array_unshift($crumbs, ['name' => $cursor->name, 'slug' => $cursor->slug]);
            $cursor = $cursor->parent;
        }

        return $crumbs;
    }

    private function relativeSubtreeDepth(Category $category): int
    {
        $max = 0;
        foreach ($category->children()->get() as $child) {
            $max = max($max, 1 + $this->relativeSubtreeDepth($child));
        }

        return $max;
    }
}
