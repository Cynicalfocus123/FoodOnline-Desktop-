<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CategoryAlias;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCategoryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_listing_is_paginated_ordered_and_hides_internal_fields(): void
    {
        Category::factory()->create(['slug' => 'second', 'path' => 'second', 'sort_order' => 2]);
        Category::factory()->create(['slug' => 'first', 'path' => 'first', 'sort_order' => 1]);
        Category::factory()->draft()->create(['slug' => 'draft', 'path' => 'draft']);
        Category::factory()->archived()->create(['slug' => 'archived', 'path' => 'archived']);
        Category::factory()->create(['slug' => 'hidden', 'path' => 'hidden', 'visibility' => 'hidden']);

        $response = $this->getJson('/api/v1/catalog/categories?root_only=1&per_page=1')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'first')
            ->assertJsonPath('meta.total', 2);

        $response->assertJsonMissingPath('data.0.status')
            ->assertJsonMissingPath('data.0.created_by')
            ->assertJsonMissingPath('data.0.path');
    }

    public function test_tree_order_breadcrumbs_canonical_and_alias_lookup(): void
    {
        $root = Category::factory()->create(['name' => 'Food', 'slug' => 'food', 'path' => 'food', 'sort_order' => 0]);
        $child = Category::factory()->childOf($root)->create(['name' => 'Snacks', 'slug' => 'snacks', 'path' => 'food/snacks']);
        CategoryAlias::query()->create(['category_id' => $child->id, 'alias_slug' => 'old-snacks', 'redirect_code' => 301]);

        $this->getJson('/api/v1/catalog/categories/tree')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'food')
            ->assertJsonPath('data.0.children.0.slug', 'snacks');

        $this->getJson('/api/v1/catalog/categories/snacks')
            ->assertOk()
            ->assertJsonPath('breadcrumbs.0.slug', 'food')
            ->assertJsonPath('breadcrumbs.1.slug', 'snacks')
            ->assertJsonPath('meta.resolved_from_alias', null);

        $this->getJson('/api/v1/catalog/categories/old-snacks')
            ->assertOk()
            ->assertJsonPath('data.slug', 'snacks')
            ->assertJsonPath('meta.resolved_from_alias', 'old-snacks')
            ->assertJsonPath('meta.redirect_code', 301);
    }

    public function test_catalog_only_is_directly_accessible_but_not_listed_and_hidden_is_not_accessible(): void
    {
        Category::factory()->create(['slug' => 'direct', 'path' => 'direct', 'visibility' => 'catalog_only']);
        Category::factory()->create(['slug' => 'hidden', 'path' => 'hidden', 'visibility' => 'hidden']);

        $this->getJson('/api/v1/catalog/categories')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/catalog/categories/direct')->assertOk();
        $this->getJson('/api/v1/catalog/categories/hidden')->assertNotFound();
        $this->getJson('/api/v1/catalog/categories?status=draft')->assertUnprocessable();
    }
}
