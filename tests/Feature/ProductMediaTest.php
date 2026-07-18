<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductMedia;
use App\Services\Catalog\ProductMediaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class ProductMediaTest extends TestCase
{
    use CreatesAdminTokens,RefreshDatabase;
    public function test_first_media_primary_change_and_delete_promotes_next(): void
    {
        $product=Product::factory()->create(); $service=app(ProductMediaService::class);
        $one=$service->create($product,['path'=>'images/products/one.webp','image_fit'=>'contain']); $this->assertTrue($one->is_primary);
        $two=$service->create($product,['path'=>'https://cdn.example.com/two.webp','image_fit'=>'cover','is_primary'=>true]); $this->assertTrue($two->is_primary); $this->assertFalse($one->fresh()->is_primary);
        $service->delete($two); $this->assertTrue($one->fresh()->is_primary);
    }
    public function test_media_api_rejects_unsafe_duplicate_invalid_fit_and_foreign_reorder(): void
    {
        [, $token]=$this->adminToken(); $product=Product::factory()->create();
        $this->withToken($token)->postJson('/api/v1/admin/products/'.$product->uuid.'/media',['path'=>'C:\\secret.php','image_fit'=>'stretch'])->assertUnprocessable()->assertJsonValidationErrors(['path','image_fit']);
        $one=ProductMedia::factory()->for($product)->primary()->create(['path'=>'images/one.webp']); $other=ProductMedia::factory()->create();
        $this->withToken($token)->postJson('/api/v1/admin/products/'.$product->uuid.'/media',['path'=>'images/one.webp'])->assertUnprocessable()->assertJsonValidationErrors('path');
        $this->withToken($token)->postJson('/api/v1/admin/products/'.$product->uuid.'/media/reorder',['media_ids'=>[$one->id,$other->id]])->assertUnprocessable()->assertJsonValidationErrors('media_ids');
    }
    public function test_maximum_guard_and_published_product_can_use_image_fallback(): void
    {
        $product=Product::factory()->create(); $service=app(ProductMediaService::class);
        foreach(range(1,12) as $i){$service->create($product,['path'=>'images/'.$i.'.webp']);}
        try{$service->create($product,['path'=>'images/13.webp']);$this->fail('Expected image limit validation.');}catch(ValidationException){$this->addToAssertionCount(1);}
        $published=Product::factory()->publishedReady()->create(); $service->delete($published->media()->firstOrFail()); $this->assertSame(0,$published->media()->count());
    }
}
