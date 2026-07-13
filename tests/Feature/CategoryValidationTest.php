<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CategoryAlias;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class CategoryValidationTest extends TestCase
{
    use CreatesAdminTokens;
    use RefreshDatabase;

    public function test_create_rejects_missing_and_invalid_contract_fields(): void
    {
        [, $token] = $this->adminToken();
        $this->withToken($token)->postJson('/api/v1/admin/categories', [
            'status' => 'live', 'visibility' => 'everyone', 'default_sort' => 'random',
            'image_path' => 'C:\\secrets\\image.php', 'canonical_url' => 'http://unsafe.example/test',
        ])->assertUnprocessable()->assertJsonValidationErrors(['name', 'slug', 'status', 'visibility', 'default_sort', 'image_path', 'canonical_url']);
    }

    public function test_duplicate_slug_and_alias_conflicts_are_rejected(): void
    {
        [, $token] = $this->adminToken();
        $category = Category::factory()->create(['slug' => 'snacks', 'path' => 'snacks']);
        CategoryAlias::query()->create(['category_id' => $category->id, 'alias_slug' => 'old-snacks']);

        $this->withToken($token)->postJson('/api/v1/admin/categories', ['name' => 'Again', 'slug' => 'snacks'])
            ->assertUnprocessable()->assertJsonValidationErrors('slug');
        $this->withToken($token)->postJson('/api/v1/admin/categories', ['name' => 'Old', 'slug' => 'old-snacks'])
            ->assertUnprocessable()->assertJsonValidationErrors('slug');
        $this->withToken($token)->postJson('/api/v1/admin/categories/'.$category->id.'/aliases', ['alias_slug' => 'snacks', 'redirect_code' => 301])
            ->assertUnprocessable()->assertJsonValidationErrors('alias_slug');
    }

    public function test_self_parent_direct_and_indirect_cycles_are_rejected(): void
    {
        [, $token] = $this->adminToken();
        $root = Category::factory()->create(['slug' => 'root', 'path' => 'root']);
        $child = Category::factory()->childOf($root)->create(['slug' => 'child', 'path' => 'root/child']);
        $grandchild = Category::factory()->childOf($child)->create(['slug' => 'grandchild', 'path' => 'root/child/grandchild']);

        $this->withToken($token)->patchJson('/api/v1/admin/categories/'.$root->id, ['parent_id' => $root->id])
            ->assertUnprocessable()->assertJsonValidationErrors('parent_id');
        $this->withToken($token)->patchJson('/api/v1/admin/categories/'.$root->id, ['parent_id' => $child->id])
            ->assertUnprocessable()->assertJsonValidationErrors('parent_id');
        $this->withToken($token)->patchJson('/api/v1/admin/categories/'.$root->id, ['parent_id' => $grandchild->id])
            ->assertUnprocessable()->assertJsonValidationErrors('parent_id');
    }

    public function test_fifth_hierarchy_level_is_rejected(): void
    {
        [, $token] = $this->adminToken();
        $parent = Category::factory()->create(['slug' => 'level-1', 'path' => 'level-1', 'depth' => 0]);
        foreach ([2, 3, 4] as $level) {
            $parent = Category::factory()->childOf($parent)->create([
                'slug' => 'level-'.$level, 'path' => $parent->path.'/level-'.$level, 'depth' => $level - 1,
            ]);
        }

        $this->withToken($token)->postJson('/api/v1/admin/categories', [
            'name' => 'Level 5', 'slug' => 'level-5', 'parent_id' => $parent->id,
        ])->assertUnprocessable()->assertJsonValidationErrors('parent_id');
    }

    public function test_reordering_rejects_duplicates_missing_and_cross_parent_ids(): void
    {
        [, $token] = $this->adminToken();
        $root = Category::factory()->create(['slug' => 'root', 'path' => 'root']);
        $one = Category::factory()->create(['slug' => 'one', 'path' => 'one']);
        $two = Category::factory()->create(['slug' => 'two', 'path' => 'two']);
        $child = Category::factory()->childOf($root)->create(['slug' => 'child', 'path' => 'root/child']);

        $this->withToken($token)->postJson('/api/v1/admin/categories/reorder', ['parent_id' => null, 'category_ids' => [$one->id, $one->id]])->assertUnprocessable();
        $this->withToken($token)->postJson('/api/v1/admin/categories/reorder', ['parent_id' => null, 'category_ids' => [$one->id]])->assertUnprocessable();
        $this->withToken($token)->postJson('/api/v1/admin/categories/reorder', ['parent_id' => null, 'category_ids' => [$one->id, $two->id, $child->id]])->assertUnprocessable();
    }
}
