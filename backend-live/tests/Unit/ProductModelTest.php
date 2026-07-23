<?php

namespace Tests\Unit;

use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductMedia;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductModelTest extends TestCase
{
    use RefreshDatabase;
    public function test_product_relationships_scopes_and_decimal_identifiers(): void
    {
        $brand=Brand::factory()->create(); $product=Product::factory()->for($brand)->create(['is_featured'=>true]);
        $variant=ProductVariant::factory()->for($product)->default()->create(['gtin'=>'00123456789012','price_amount'=>'10.25']);
        $media=ProductMedia::factory()->for($product)->primary()->create();
        $this->assertTrue($product->category()->exists()); $this->assertTrue($product->brand->is($brand));
        $this->assertTrue($product->defaultVariant->is($variant)); $this->assertTrue($product->primaryMedia->is($media));
        $this->assertSame('00123456789012',$variant->gtin); $this->assertSame('10.25',$variant->price_amount);
        $this->assertTrue(Product::query()->featured()->get()->contains($product));
    }
}
