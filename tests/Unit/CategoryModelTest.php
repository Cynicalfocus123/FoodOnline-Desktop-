<?php

namespace Tests\Unit;

use App\Models\Category;
use App\Models\CategoryAlias;
use Database\Seeders\CategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_relationships_scopes_ordering_aliases_and_soft_deletes(): void
    {
        $root = Category::factory()->create(['slug' => 'root', 'path' => 'root', 'sort_order' => 2]);
        $first = Category::factory()->childOf($root)->create(['slug' => 'first', 'path' => 'root/first', 'sort_order' => 1]);
        Category::factory()->childOf($root)->create(['slug' => 'second', 'path' => 'root/second', 'sort_order' => 2]);
        $draft = Category::factory()->draft()->create();
        CategoryAlias::query()->create(['category_id' => $first->id, 'alias_slug' => 'old-first', 'redirect_code' => 301]);

        $this->assertTrue($first->parent->is($root));
        $this->assertSame('first', $root->children()->first()->slug);
        $this->assertSame('old-first', $first->aliases()->first()->alias_slug);
        $this->assertFalse(Category::query()->published()->get()->contains($draft));
        $this->assertTrue(Category::query()->navigation()->get()->contains($root));
        $this->assertTrue(Category::query()->homepage()->get()->contains($root));

        $first->delete();
        $this->assertSoftDeleted($first);
        $this->assertNull(Category::query()->find($first->id));
        $this->assertNotNull(Category::withTrashed()->find($first->id));
    }

    public function test_category_seeder_is_idempotent_and_preserves_frontend_contract(): void
    {
        $this->seed(CategorySeeder::class);
        $this->seed(CategorySeeder::class);

        $this->assertSame(16, Category::query()->count());
        $this->assertSame(1, CategoryAlias::query()->count());
        $this->assertSame('vegan-foods', CategoryAlias::query()->where('alias_slug', 'baby-care')->firstOrFail()->category->slug);
    }
}
