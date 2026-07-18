<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductMedia;
use App\Models\ProductVariant;
use App\Services\Catalog\ProductPublicationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class ProductPublicationTest extends TestCase
{
    use CreatesAdminTokens,RefreshDatabase;
    public function test_publication_requires_category_and_sellable_default_variant_but_not_media(): void
    {
        [$admin]=$this->adminToken(); $product=Product::factory()->create(['category_id'=>Category::factory()->draft()]);
        try{app(ProductPublicationService::class)->publish($product,$admin);$this->fail('Expected readiness validation.');}catch(ValidationException $e){$this->assertArrayHasKey('category',$e->errors());$this->assertArrayHasKey('variants',$e->errors());$this->assertArrayNotHasKey('media',$e->errors());}
    }
    public function test_complete_product_publishes_archives_and_restores(): void
    {
        [$admin]=$this->adminToken(); $product=Product::factory()->create(); ProductVariant::factory()->for($product)->default()->create();
        $service=app(ProductPublicationService::class); $published=$service->publish($product,$admin); $this->assertSame('published',$published->status); $this->assertNotNull($published->published_at);
        $this->getJson('/api/v1/catalog/products/'.$published->slug)->assertOk(); $archived=$service->archive($published,$admin); $this->assertNull($archived->published_at); $this->getJson('/api/v1/catalog/products/'.$published->slug)->assertNotFound(); $this->assertSame('draft',$service->restore($archived,$admin)->status);
    }
    public function test_category_visibility_rules(): void
    {
        $direct=Product::factory()->publishedReady()->create(['category_id'=>Category::factory()->create(['visibility'=>'catalog_only'])]);
        $hidden=Product::factory()->publishedReady()->create(['category_id'=>Category::factory()->create(['visibility'=>'hidden'])]);
        $this->getJson('/api/v1/catalog/products')->assertOk()->assertJsonCount(0,'data'); $this->getJson('/api/v1/catalog/products/'.$direct->slug)->assertOk(); $this->getJson('/api/v1/catalog/products/'.$hidden->slug)->assertNotFound();
    }
}
