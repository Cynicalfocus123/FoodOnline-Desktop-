<?php

namespace App\Services\Catalog;

use App\Models\Category;
use App\Models\CategoryAlias;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Services\Media\ManagedMediaDeletionService;

class CategoryService
{
    public function __construct(
        private readonly CategoryHierarchyService $hierarchy,
        private readonly CategoryCache $cache,
        private readonly ManagedMediaDeletionService $deletion,
    ) {}

    /** @param array<string, mixed> $data */
    public function create(array $data, User $admin): Category
    {
        return DB::transaction(function () use ($data, $admin): Category {
            $data = $this->normalizePlacement([
                'status' => 'draft',
                'visibility' => 'public',
                'is_featured' => false,
                'show_in_navigation' => false,
                'show_on_homepage' => false,
                'default_sort' => 'featured',
                'robots_index' => true,
                'robots_follow' => true,
                ...$data,
            ]);
            $parentId = isset($data['parent_id']) ? (int) $data['parent_id'] : null;
            $metadata = $this->hierarchy->metadata(null, $parentId, (string) $data['slug']);
            if (! array_key_exists('sort_order', $data)) {
                $data['sort_order'] = $this->nextSortOrder($parentId);
            }
            $data['uuid'] = (string) Str::uuid();
            $data['parent_id'] = $parentId;
            $data['depth'] = $metadata['depth'];
            $data['path'] = $metadata['path'];
            $data['created_by'] = $admin->id;
            $data['updated_by'] = $admin->id;
            $data['published_at'] = ($data['status'] ?? 'draft') === 'published' ? now() : null;

            $category = Category::query()->create($data);
            $this->cache->invalidate();

            return $category->refresh();
        });
    }

    /** @param array<string, mixed> $data */
    public function update(Category $category, array $data, User $admin): Category
    {
        return DB::transaction(function () use ($category, $data, $admin): Category {
            $data = $this->normalizePlacement($data, $category);
            $oldSlug = $category->slug;
            $oldMedia = collect(['image_path', 'icon_path', 'desktop_banner_path', 'mobile_banner_path'])->mapWithKeys(fn ($field) => [$field => $category->{$field}]);
            $wasPublished = $category->status === 'published';
            $parentId = array_key_exists('parent_id', $data)
                ? ($data['parent_id'] === null ? null : (int) $data['parent_id'])
                : $category->parent_id;
            $slug = (string) ($data['slug'] ?? $category->slug);
            $metadata = $this->hierarchy->metadata($category, $parentId, $slug);

            $data['parent_id'] = $parentId;
            $data['depth'] = $metadata['depth'];
            $data['path'] = $metadata['path'];
            $data['updated_by'] = $admin->id;
            $newStatus = (string) ($data['status'] ?? $category->status);
            if ($newStatus === 'published' && $category->published_at === null) {
                $data['published_at'] = now();
            } elseif ($newStatus !== 'published') {
                $data['published_at'] = null;
            }

            $category->fill($data)->save();
            foreach ($oldMedia as $field => $oldPath) {
                if (array_key_exists($field, $data) && $oldPath !== $category->{$field}) { $this->deletion->afterCommit($oldPath); }
            }
            if ($oldSlug !== $slug && $wasPublished) {
                CategoryAlias::query()->updateOrCreate(
                    ['alias_slug' => $oldSlug],
                    ['category_id' => $category->id, 'redirect_code' => 301, 'is_active' => true, 'created_by' => $admin->id],
                );
            }
            $this->hierarchy->rebuildDescendants($category);
            $this->cache->invalidate();

            return $category->refresh();
        });
    }

    public function archive(Category $category, User $admin): Category
    {
        return DB::transaction(function () use ($category, $admin): Category {
            $category->forceFill([
                'status' => 'archived',
                'published_at' => null,
                'show_in_navigation' => false,
                'show_on_homepage' => false,
                'updated_by' => $admin->id,
            ])->save();
            $this->cache->invalidate();

            return $category->refresh();
        });
    }

    public function restore(Category $category, User $admin): Category
    {
        return DB::transaction(function () use ($category, $admin): Category {
            $category->forceFill([
                'status' => 'draft',
                'published_at' => null,
                'show_in_navigation' => false,
                'show_on_homepage' => false,
                'updated_by' => $admin->id,
            ])->save();
            $this->cache->invalidate();

            return $category->refresh();
        });
    }

    public function permanentlyDelete(Category $category, string $confirmation): void
    {
        if (! hash_equals($category->slug, $confirmation)) {
            throw ValidationException::withMessages(['confirm_slug' => ['The confirmation slug does not match the category.']]);
        }
        if ($category->status !== 'archived') {
            throw ValidationException::withMessages(['category' => ['Archive the category before permanently deleting it.']]);
        }
        if ($category->children()->withTrashed()->exists()) {
            throw ValidationException::withMessages(['category' => ['Reassign or remove this category\'s child categories before permanently deleting it.']]);
        }
        if ($category->products()->exists()) {
            throw ValidationException::withMessages(['category' => ['Reassign this category\'s products before permanently deleting it.']]);
        }

        DB::transaction(function () use ($category): void {
            $mediaPaths = collect(['image_path', 'icon_path', 'desktop_banner_path', 'mobile_banner_path'])
                ->map(fn (string $field) => $category->{$field})
                ->filter()
                ->values();
            $category->aliases()->delete();
            $category->forceDelete();
            $mediaPaths->each(fn (string $path) => $this->deletion->afterCommit($path));
            $this->cache->invalidate();
        });
    }

    /** @param array<int, int> $ids */
    public function reorder(?int $parentId, array $ids, User $admin): void
    {
        DB::transaction(function () use ($parentId, $ids, $admin): void {
            $siblings = Category::query()->where('parent_id', $parentId)->orderBy('id')->pluck('id')->map(fn ($id) => (int) $id)->all();
            $provided = array_map('intval', $ids);
            $expected = $siblings;
            sort($expected);
            $actual = $provided;
            sort($actual);
            if (count($provided) !== count(array_unique($provided)) || $actual !== $expected) {
                throw ValidationException::withMessages(['category_ids' => ['Provide every non-deleted sibling exactly once.']]);
            }
            foreach ($provided as $position => $id) {
                Category::query()->whereKey($id)->update(['sort_order' => $position, 'updated_by' => $admin->id, 'updated_at' => now()]);
            }
            $this->cache->invalidate();
        });
    }

    /** @param array<string, mixed> $data */
    public function addAlias(Category $category, array $data, User $admin): CategoryAlias
    {
        $alias = CategoryAlias::query()->create([
            ...$data,
            'category_id' => $category->id,
            'created_by' => $admin->id,
        ]);
        $this->cache->invalidate();

        return $alias;
    }

    public function removeAlias(CategoryAlias $alias): void
    {
        $alias->delete();
        $this->cache->invalidate();
    }

    private function nextSortOrder(?int $parentId): int
    {
        return ((int) Category::query()->where('parent_id', $parentId)->max('sort_order')) + 1;
    }

    /** @param array<string, mixed> $data @return array<string, mixed> */
    private function normalizePlacement(array $data, ?Category $category = null): array
    {
        $navigation = (bool) ($data['show_in_navigation'] ?? $category?->show_in_navigation ?? false);
        $homepage = (bool) ($data['show_on_homepage'] ?? $category?->show_on_homepage ?? false);
        $placementWasEnabled = (array_key_exists('show_in_navigation', $data) && $navigation)
            || (array_key_exists('show_on_homepage', $data) && $homepage);
        $status = (string) ($data['status'] ?? $category?->status ?? 'draft');
        $visibility = (string) ($data['visibility'] ?? $category?->visibility ?? 'public');

        if ($placementWasEnabled) {
            $data['status'] = $status = 'published';
            $data['visibility'] = $visibility = 'public';
        }

        if ($status !== 'published' || $visibility !== 'public') {
            $data['show_in_navigation'] = false;
            $data['show_on_homepage'] = false;
        }

        return $data;
    }
}
