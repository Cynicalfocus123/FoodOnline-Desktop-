<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class BrandAdminApiTest extends TestCase
{
    use CreatesAdminTokens,RefreshDatabase;
    public function test_brand_admin_authorization_creation_normalization_and_listing(): void
    {
        $this->getJson('/api/v1/admin/brands')->assertUnauthorized(); [, $token]=$this->adminToken();
        $response=$this->withToken($token)->postJson('/api/v1/admin/brands',['name'=>'Kewpie','slug'=>'kewpie','country_code'=>'jp','logo_path'=>'images/brands/kewpie.webp'])->assertCreated()->assertJsonPath('data.country_code','JP');
        $this->assertNotNull($response->json('data.uuid'));
        $this->withToken($token)->postJson('/api/v1/admin/brands',['name'=>'Again','slug'=>'kewpie'])->assertUnprocessable()->assertJsonValidationErrors('slug');
        $this->withToken($token)->postJson('/api/v1/admin/brands',['name'=>'Bad','slug'=>'bad','country_code'=>'USA','logo_path'=>'C:\\bad.php'])->assertUnprocessable()->assertJsonValidationErrors(['country_code','logo_path']);
        $this->withToken($token)->getJson('/api/v1/admin/brands?search=Kew&per_page=1')->assertOk()->assertJsonPath('meta.total',1);
    }
    public function test_inactive_brands_are_hidden_publicly_but_existing_relationship_remains(): void
    {
        $brand=Brand::factory()->inactive()->create(); $product=Product::factory()->for($brand)->create();
        $this->assertTrue($product->brand->is($brand)); $this->getJson('/api/v1/catalog/brands')->assertOk()->assertJsonCount(0,'data');
        [, $token]=$this->adminToken(); $category=Category::factory()->create();
        $this->withToken($token)->postJson('/api/v1/admin/products',['category_id'=>$category->id,'brand_id'=>$brand->id,'name'=>'Blocked','slug'=>'blocked'])->assertUnprocessable()->assertJsonValidationErrors('brand_id');
    }
}
