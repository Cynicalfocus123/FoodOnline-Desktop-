<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Services\Catalog\CategoryCache;
use Database\Seeders\CategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class CategoryLifecycleRepairTest extends TestCase
{
    use CreatesAdminTokens, RefreshDatabase;

    public function test_name_only_category_creation_uses_safe_optional_defaults_without_media_or_seo(): void
    {
        [, $token] = $this->adminToken();
        config(['foodonlines.media.uploads_enabled' => false]);

        $this->withToken($token)->postJson('/api/v1/admin/categories', ['name' => 'Ice Cream'])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'ice-cream')
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.visibility', 'public')
            ->assertJsonPath('data.media.image_path', null)
            ->assertJsonPath('data.seo.meta_title', null)
            ->assertJsonCount(0, 'data.aliases');
    }

    public function test_public_placement_normalizes_and_non_public_states_clear_both_flags(): void
    {
        [, $token] = $this->adminToken();
        $created = $this->withToken($token)->postJson('/api/v1/admin/categories', [
            'name' => 'Placement', 'show_on_homepage' => true,
        ])->assertCreated()->assertJsonPath('data.status', 'published')->assertJsonPath('data.visibility', 'public');
        $id = $created->json('data.id');

        foreach ([
            ['status' => 'draft'], ['status' => 'archived'], ['visibility' => 'hidden'], ['visibility' => 'catalog_only'],
        ] as $change) {
            $this->withToken($token)->patchJson('/api/v1/admin/categories/'.$id, [
                'status' => 'published', 'visibility' => 'public', 'show_in_navigation' => true, 'show_on_homepage' => true,
            ])->assertOk();
            $this->withToken($token)->patchJson('/api/v1/admin/categories/'.$id, $change)
                ->assertOk()->assertJsonPath('data.show_in_navigation', false)->assertJsonPath('data.show_on_homepage', false);
        }
    }

    public function test_archive_restore_and_delete_lifecycle_invalidates_cache_and_blocks_products(): void
    {
        [, $token] = $this->adminToken();
        $category = Category::factory()->create();
        $version = app(CategoryCache::class)->version();
        $this->withToken($token)->postJson('/api/v1/admin/categories/'.$category->id.'/archive')
            ->assertOk()->assertJsonPath('data.show_in_navigation', false)->assertJsonPath('data.show_on_homepage', false);
        $this->assertGreaterThan($version, app(CategoryCache::class)->version());
        $this->getJson('/api/v1/catalog/categories?navigation=1')->assertOk()->assertJsonMissing(['id' => (string) $category->id]);
        $this->getJson('/api/v1/catalog/categories?homepage=1')->assertOk()->assertJsonMissing(['id' => (string) $category->id]);
        $this->withToken($token)->postJson('/api/v1/admin/categories/'.$category->id.'/restore')
            ->assertOk()->assertJsonPath('data.status', 'draft')->assertJsonPath('data.show_in_navigation', false);
        $this->withToken($token)->postJson('/api/v1/admin/categories/'.$category->id.'/archive')->assertOk();
        Product::factory()->create(['category_id' => $category->id]);
        $this->withToken($token)->deleteJson('/api/v1/admin/categories/'.$category->id)
            ->assertUnprocessable()->assertJsonValidationErrors('category');
    }

    public function test_backfill_restores_soft_deleted_rows_is_repeatable_and_preserves_existing_and_ice_cream(): void
    {
        $edited = Category::factory()->draft()->create([
            'slug' => 'dairy-bread-eggs', 'path' => 'dairy-bread-eggs', 'name' => 'My Dairy',
            'visibility' => 'hidden', 'image_path' => 'r2://categories/example/image-example.webp',
            'meta_title' => 'Custom SEO', 'show_in_navigation' => false, 'show_on_homepage' => false,
        ]);
        $iceCream = Category::factory()->create(['slug' => 'ice-cream', 'path' => 'ice-cream', 'name' => 'Ice cream']);
        $softDeleted = Category::factory()->create([
            'slug' => 'paan-corner', 'path' => 'paan-corner', 'name' => 'Original Paan',
            'show_in_navigation' => true, 'show_on_homepage' => true,
        ]);
        $softDeletedId = $softDeleted->id;
        $softDeleted->delete();

        $firstRun = app(\App\Services\Catalog\LegacyCategoryBackfill::class)->run();
        $this->seed(CategorySeeder::class);

        $this->assertSame(1, $firstRun['categories_restored']);
        $this->assertSame(14, $firstRun['categories_created']);
        $this->assertSame(17, Category::query()->count());
        $legacySlugs = array_column(app(\App\Services\Catalog\LegacyCategoryBackfill::class)->categories(), 1);
        $this->assertSame(16, Category::query()->whereIn('slug', $legacySlugs)->count());
        $this->assertSame('My Dairy', $edited->fresh()->name);
        $this->assertSame('hidden', $edited->fresh()->visibility);
        $this->assertSame('r2://categories/example/image-example.webp', $edited->fresh()->image_path);
        $this->assertSame('Custom SEO', $edited->fresh()->meta_title);
        $this->assertSame('Ice cream', $iceCream->fresh()->name);
        $this->assertSame($softDeletedId, Category::query()->where('slug', 'paan-corner')->value('id'));
        $this->assertSame('Original Paan', Category::query()->whereKey($softDeletedId)->value('name'));
        $this->assertTrue((bool) Category::query()->whereKey($softDeletedId)->value('show_on_homepage'));
        $this->getJson('/api/v1/catalog/categories?homepage=1&per_page=100')
            ->assertOk()->assertJsonFragment(['id' => (string) $softDeletedId, 'slug' => 'paan-corner']);
        $this->assertSame(1, \App\Models\CategoryAlias::query()->where('alias_slug', 'baby-care')->count());
    }
}
