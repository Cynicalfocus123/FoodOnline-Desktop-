<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CategoryAlias;
use App\Services\Catalog\CategoryCache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class AdminCategoryApiTest extends TestCase
{
    use CreatesAdminTokens;
    use RefreshDatabase;

    public function test_admin_category_routes_require_admin_authentication(): void
    {
        $this->getJson('/api/v1/admin/categories')->assertUnauthorized();
        $this->postJson('/api/v1/admin/categories', ['name' => 'Test', 'slug' => 'test'])->assertUnauthorized();
    }

    public function test_authorized_admin_can_create_update_move_and_automatically_alias_published_slug(): void
    {
        [$admin, $token] = $this->adminToken();
        $parent = Category::factory()->create(['slug' => 'food', 'path' => 'food']);

        $created = $this->withToken($token)->postJson('/api/v1/admin/categories', [
            'name' => 'Snacks', 'slug' => 'snacks', 'status' => 'published', 'visibility' => 'public',
            'parent_id' => $parent->id, 'default_sort' => 'popular', 'show_in_navigation' => true,
        ])->assertCreated()->assertJsonPath('data.path', 'food/snacks');

        $id = (int) $created->json('data.id');
        $this->withToken($token)->patchJson('/api/v1/admin/categories/'.$id, [
            'slug' => 'snack-foods', 'parent_id' => null,
        ])->assertOk()->assertJsonPath('data.path', 'snack-foods')->assertJsonPath('data.updated_by', null);

        $category = Category::query()->findOrFail($id);
        $this->assertSame($admin->id, $category->updated_by);
        $this->assertDatabaseHas('category_aliases', ['category_id' => $id, 'alias_slug' => 'snacks', 'redirect_code' => 301]);
    }

    public function test_admin_can_reorder_archive_restore_and_manage_aliases_with_cache_invalidation(): void
    {
        [, $token] = $this->adminToken();
        $first = Category::factory()->create(['slug' => 'first', 'path' => 'first', 'sort_order' => 0]);
        $second = Category::factory()->create(['slug' => 'second', 'path' => 'second', 'sort_order' => 1]);
        $version = app(CategoryCache::class)->version();

        $this->withToken($token)->postJson('/api/v1/admin/categories/reorder', [
            'parent_id' => null, 'category_ids' => [$second->id, $first->id],
        ])->assertOk();
        $this->assertSame(0, $second->refresh()->sort_order);
        $this->assertGreaterThan($version, app(CategoryCache::class)->version());

        $this->withToken($token)->postJson('/api/v1/admin/categories/'.$first->id.'/archive')->assertOk()->assertJsonPath('data.status', 'archived');
        $this->withToken($token)->postJson('/api/v1/admin/categories/'.$first->id.'/restore')->assertOk()->assertJsonPath('data.status', 'draft');

        $alias = $this->withToken($token)->postJson('/api/v1/admin/categories/'.$first->id.'/aliases', [
            'alias_slug' => 'old-first', 'redirect_code' => 302,
        ])->assertCreated();
        $aliasId = $alias->json('data.id');
        $this->withToken($token)->getJson('/api/v1/admin/categories/'.$first->id.'/aliases')->assertOk()->assertJsonPath('data.0.alias_slug', 'old-first');
        $this->withToken($token)->deleteJson('/api/v1/admin/category-aliases/'.$aliasId)->assertNoContent();
        $this->assertSame(0, CategoryAlias::query()->count());
    }

    public function test_permanent_delete_requires_archive_confirmation_and_no_children(): void
    {
        [, $token] = $this->adminToken();
        $root = Category::factory()->archived()->create(['slug' => 'root', 'path' => 'root']);
        Category::factory()->childOf($root)->create(['slug' => 'child', 'path' => 'root/child']);

        $this->withToken($token)->deleteJson('/api/v1/admin/categories/'.$root->id, ['confirm_slug' => 'root'])
            ->assertUnprocessable()->assertJsonValidationErrors('category');
        Category::withTrashed()->where('parent_id', $root->id)->firstOrFail()->forceDelete();
        $this->withToken($token)->deleteJson('/api/v1/admin/categories/'.$root->id, ['confirm_slug' => 'wrong'])
            ->assertUnprocessable()->assertJsonValidationErrors('confirm_slug');
        $this->withToken($token)->deleteJson('/api/v1/admin/categories/'.$root->id, ['confirm_slug' => 'root'])->assertNoContent();
        $this->assertDatabaseMissing('categories', ['id' => $root->id]);
    }
}
