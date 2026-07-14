<?php

namespace Tests\Feature;

use App\Models\MediaUpload;
use App\Models\Product;
use App\Models\ProductMedia;
use App\Services\Catalog\ProductMediaService;
use App\Services\Media\ManagedMediaDeletionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class ManagedMediaDeletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_managed_objects_delete_only_after_references_are_removed(): void
    {
        Storage::fake('r2');
        $product = Product::factory()->create(); $uuid = (string) Str::uuid();
        $key = 'products/'.$product->uuid.'/media-'.$uuid.'.webp'; $path = 'r2://'.$key;
        Storage::disk('r2')->put($key, 'image');
        $upload = MediaUpload::query()->create(['uuid'=>$uuid,'purpose'=>'product_image','target_type'=>'product','target_id'=>$product->id,'disk'=>'r2','object_key'=>$key,'original_filename'=>'x.webp','expected_mime_type'=>'image/webp','expected_size_bytes'=>5,'status'=>'finalized','expires_at'=>now()->addMinute(),'finalized_at'=>now()]);
        $one = ProductMedia::factory()->for($product)->primary()->create(['path'=>$path]);
        ProductMedia::factory()->for($product)->secondary()->create(['path'=>'https://example.com/external.webp']);
        $this->assertFalse(app(ManagedMediaDeletionService::class)->deletePath($path));
        app(ProductMediaService::class)->delete($one);
        Storage::disk('r2')->assertMissing($key);
        $this->assertSame('finalized', $upload->fresh()->status);
    }
}
