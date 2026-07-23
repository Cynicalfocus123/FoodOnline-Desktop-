<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\CategoryAlias;
use App\Models\Product;
use App\Models\ProductMedia;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicProductCatalogApiTest extends TestCase
{
    use RefreshDatabase;
    private function product(array $attributes=[],array $variant=[]): Product
    {
        $product=Product::factory()->create([...$attributes,'status'=>'published','published_at'=>now()]); ProductVariant::factory()->for($product)->default()->create($variant); ProductVariant::factory()->for($product)->inactive()->create(); ProductMedia::factory()->for($product)->primary()->create(['sort_order'=>2]); ProductMedia::factory()->for($product)->secondary()->create(['sort_order'=>1]); return $product;
    }
    public function test_listing_filters_search_sorts_paginates_and_aliases(): void
    {
        $category=Category::factory()->create(['slug'=>'rice']); CategoryAlias::query()->create(['category_id'=>$category->id,'alias_slug'=>'old-rice']); $brand=Brand::factory()->create(['name'=>'Kewpie','slug'=>'kewpie']);
        $cheap=$this->product(['category_id'=>$category->id,'brand_id'=>$brand->id,'name'=>'Rice One','slug'=>'rice-one','country_of_origin_code'=>'JP','storage_type'=>'ambient','is_featured'=>true],['sku'=>'RICE-ONE','gtin'=>'00123456789012','price_amount'=>'5.00','availability_status'=>'in_stock']);
        $this->product(['category_id'=>$category->id,'name'=>'Rice Two','slug'=>'rice-two'],['sku'=>'RICE-TWO','price_amount'=>'15.00','availability_status'=>'out_of_stock']); Product::factory()->create(['category_id'=>$category->id,'name'=>'Draft Hidden']);
        $this->getJson('/api/v1/catalog/products?category=old-rice&brand=kewpie&country_of_origin=jp&storage_type=ambient&availability=in_stock&featured=1&min_price=1&max_price=10&sort=price_asc&per_page=1')->assertOk()->assertJsonPath('data.0.slug',$cheap->slug)->assertJsonPath('meta.total',1);
        foreach(['Rice One','Kewpie','RICE-ONE','00123456789012'] as $term){$this->getJson('/api/v1/catalog/products?search='.urlencode($term))->assertOk()->assertJsonPath('meta.total',1);}
    }
    public function test_detail_contract_derives_default_fields_orders_media_and_hides_internal_data(): void
    {
        $product=$this->product(['name'=>'Complete Product','slug'=>'complete'],['sku'=>'COMPLETE','price_amount'=>'8.50','compare_at_price_amount'=>'10.00','size_label'=>'500 g']);
        $response=$this->getJson('/api/v1/catalog/products/'.$product->slug)->assertOk()->assertJsonPath('data.price','8.50')->assertJsonPath('data.old_price','10.00')->assertJsonPath('data.sku','COMPLETE')->assertJsonPath('data.size','500 g')->assertJsonCount(1,'data.variants')->assertJsonCount(2,'data.image_urls');
        $response->assertJsonMissingPath('data.created_by')->assertJsonMissingPath('data.variants.0.is_active')->assertJsonMissingPath('data.status');
    }
    public function test_public_brand_list_requires_active_brand_with_visible_product(): void
    {
        $active=Brand::factory()->create(['name'=>'Visible Brand','slug'=>'visible']); $inactive=Brand::factory()->inactive()->create(); $this->product(['brand_id'=>$active->id]); $this->product(['brand_id'=>$inactive->id]);
        $this->getJson('/api/v1/catalog/brands')->assertOk()->assertJsonCount(1,'data')->assertJsonPath('data.0.slug','visible');
    }
}
