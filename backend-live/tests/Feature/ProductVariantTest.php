<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Catalog\ProductVariantService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class ProductVariantTest extends TestCase
{
    use CreatesAdminTokens,RefreshDatabase;
    private function payload(string $sku): array { return ['title'=>'500 g Bag','sku'=>$sku,'gtin'=>'00123456789012','net_content_value'=>500,'net_content_unit'=>'g','pack_count'=>1,'package_type'=>'bag','price_amount'=>9.99,'compare_at_price_amount'=>12.00,'currency_code'=>'USD','availability_status'=>'in_stock']; }
    public function test_first_variant_defaults_sku_normalizes_and_default_moves(): void
    {
        $product=Product::factory()->create(); $service=app(ProductVariantService::class);
        $first=$service->create($product,$this->payload(' sku-one ')); $this->assertTrue($first->is_default); $this->assertSame('SKU-ONE',$first->sku);
        $second=$service->create($product,[...$this->payload('SKU-TWO'),'gtin'=>'012345678905','is_default'=>true]);
        $this->assertTrue($second->is_default); $this->assertFalse($first->fresh()->is_default);
        $service->deactivate($second); $this->assertFalse($second->fresh()->is_active); $this->assertTrue($first->fresh()->is_default);
    }
    public function test_variant_api_validates_identifiers_prices_units_states_and_reorder_ownership(): void
    {
        [, $token]=$this->adminToken(); $product=Product::factory()->create();
        $this->withToken($token)->postJson('/api/v1/admin/products/'.$product->uuid.'/variants',[...$this->payload('bad space'),'gtin'=>'123','price_amount'=>0,'compare_at_price_amount'=>0,'net_content_unit'=>null,'package_type'=>'crate','availability_status'=>'maybe'])->assertUnprocessable()->assertJsonValidationErrors(['sku','gtin','price_amount','compare_at_price_amount','net_content_unit','package_type','availability_status']);
        $one=ProductVariant::factory()->for($product)->default()->create(); $other=ProductVariant::factory()->create();
        $this->withToken($token)->postJson('/api/v1/admin/products/'.$product->uuid.'/variants/reorder',['variant_ids'=>[$one->uuid,$other->uuid]])->assertUnprocessable()->assertJsonValidationErrors('variant_ids');
    }
    public function test_published_product_cannot_lose_final_active_variant(): void
    {
        $product=Product::factory()->publishedReady()->create(); $variant=$product->variants()->firstOrFail();
        $this->expectException(ValidationException::class); app(ProductVariantService::class)->deactivate($variant);
    }
}
