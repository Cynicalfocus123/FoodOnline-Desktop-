<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class ProductAdminApiTest extends TestCase
{
    use CreatesAdminTokens,RefreshDatabase;
    public function test_admin_creates_updates_archives_and_restores_product_without_deleting_children(): void
    {
        [, $token]=$this->adminToken(); $category=Category::factory()->create(); $brand=Brand::factory()->create();
        $created=$this->withToken($token)->postJson('/api/v1/admin/products',['category_id'=>$category->id,'brand_id'=>$brand->id,'name'=>'Rice','slug'=>'rice','storage_type'=>'ambient'])->assertCreated()->assertJsonPath('data.status','draft');
        $uuid=$created->json('data.uuid');
        $this->withToken($token)->patchJson('/api/v1/admin/products/'.$uuid,['name'=>'Jasmine Rice'])->assertOk()->assertJsonPath('data.name','Jasmine Rice');
        $this->withToken($token)->deleteJson('/api/v1/admin/products/'.$uuid)->assertNoContent();
        $product=Product::query()->where('uuid',$uuid)->firstOrFail(); $this->assertSame('archived',$product->status);
        $this->withToken($token)->postJson('/api/v1/admin/products/'.$uuid.'/restore')->assertOk()->assertJsonPath('data.status','draft');
    }
    public function test_product_validation_and_published_slug_lock(): void
    {
        [, $token]=$this->adminToken(); $category=Category::factory()->create();
        $this->withToken($token)->postJson('/api/v1/admin/products',['category_id'=>999999,'name'=>'Bad','slug'=>'bad','storage_type'=>'hot'])->assertUnprocessable()->assertJsonValidationErrors(['category_id','storage_type']);
        $product=Product::factory()->publishedReady()->create(['category_id'=>$category->id,'slug'=>'stable']);
        $this->withToken($token)->patchJson('/api/v1/admin/products/'.$product->uuid,['slug'=>'changed'])->assertUnprocessable()->assertJsonValidationErrors('slug');
    }
}
