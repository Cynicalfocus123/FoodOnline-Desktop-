<?php

namespace Tests\Feature;

use App\Models\MediaUpload;
use App\Models\Product;
use App\Models\ProductMedia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class MediaCleanupCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_cleanup_is_bounded_idempotent_and_preserves_finalized_or_referenced_objects(): void
    {
        Storage::fake('r2'); $product=Product::factory()->create();
        $expired=$this->upload($product,'pending',now()->subMinute());Storage::disk('r2')->put($expired->object_key,'x');
        $finalized=$this->upload($product,'finalized',now()->subMinute());Storage::disk('r2')->put($finalized->object_key,'x');
        $referenced=$this->upload($product,'cleanup_pending',now()->subMinute());Storage::disk('r2')->put($referenced->object_key,'x');ProductMedia::factory()->for($product)->primary()->create(['path'=>'r2://'.$referenced->object_key]);
        $this->artisan('media:cleanup --limit=100')->expectsOutputToContain('inspected 2 record(s); cleaned 1')->assertSuccessful();
        Storage::disk('r2')->assertMissing($expired->object_key);Storage::disk('r2')->assertExists($finalized->object_key);Storage::disk('r2')->assertExists($referenced->object_key);
        $this->assertSame('deleted',$expired->fresh()->status);$this->assertSame('finalized',$finalized->fresh()->status);
        $this->artisan('media:cleanup --limit=100')->assertSuccessful();Storage::disk('r2')->assertExists($referenced->object_key);
    }
    private function upload(Product $product,string $status,mixed $expires):MediaUpload{$uuid=(string)Str::uuid();return MediaUpload::query()->create(['uuid'=>$uuid,'purpose'=>'product_image','target_type'=>'product','target_id'=>$product->id,'disk'=>'r2','object_key'=>'products/'.$product->uuid.'/media-'.$uuid.'.webp','original_filename'=>'x.webp','expected_mime_type'=>'image/webp','expected_size_bytes'=>1,'status'=>$status,'expires_at'=>$expires,'finalized_at'=>$status==='finalized'?now():null]);}
}
