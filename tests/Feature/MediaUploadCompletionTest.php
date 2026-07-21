<?php

namespace Tests\Feature;

use App\Models\MediaUpload;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class MediaUploadCompletionTest extends TestCase
{
    use CreatesAdminTokens, RefreshDatabase;

    public function test_valid_image_finalizes_and_creates_primary_product_media(): void
    {
        [$admin, $token] = $this->adminToken();
        Storage::fake('r2');
        $product = Product::factory()->create();
        $bytes = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=');
        $upload = $this->upload($product, $admin->id, strlen($bytes));
        Storage::disk('r2')->put($upload->object_key, $bytes);

        $this->withToken($token)->postJson('/api/v1/admin/media-uploads/'.$upload->uuid.'/complete', ['alt_text' => 'Package front', 'image_fit' => 'contain'])
            ->assertOk()->assertJsonPath('upload.status', 'finalized')->assertJsonPath('data.is_primary', true);
        $media = $product->media()->firstOrFail();
        $this->assertSame('r2://'.$upload->object_key, $media->path);
        $this->assertSame($media->id, $upload->fresh()->product_media_id);

        $this->withToken($token)->postJson('/api/v1/admin/media-uploads/'.$upload->uuid.'/complete', ['alt_text' => 'Package front'])
            ->assertOk()->assertJsonPath('upload.status', 'finalized')->assertJsonPath('data.id', (string) $media->id);
        $this->assertSame(1, $product->fresh()->media()->count());
    }

    public function test_missing_expired_wrong_size_and_disguised_objects_are_rejected(): void
    {
        [$admin, $token] = $this->adminToken();
        Storage::fake('r2');
        $product = Product::factory()->create();
        $missing = $this->upload($product, $admin->id, 10);
        $this->withToken($token)->postJson('/api/v1/admin/media-uploads/'.$missing->uuid.'/complete')->assertUnprocessable()->assertJsonValidationErrors('upload');
        $expired = $this->upload($product, $admin->id, 3, now()->subMinute());
        $this->withToken($token)->postJson('/api/v1/admin/media-uploads/'.$expired->uuid.'/complete')->assertUnprocessable()->assertJsonValidationErrors('upload');
        $wrong = $this->upload($product, $admin->id, 4); Storage::disk('r2')->put($wrong->object_key, 'abc');
        $this->withToken($token)->postJson('/api/v1/admin/media-uploads/'.$wrong->uuid.'/complete')->assertUnprocessable()->assertJsonValidationErrors('size_bytes');
        $fake = $this->upload($product, $admin->id, 3); Storage::disk('r2')->put($fake->object_key, 'abc');
        $this->withToken($token)->postJson('/api/v1/admin/media-uploads/'.$fake->uuid.'/complete')->assertUnprocessable()->assertJsonValidationErrors('mime_type');
    }

    private function upload(Product $product, int $adminId, int $size, mixed $expiresAt = null): MediaUpload
    {
        $uuid = (string) Str::uuid();
        return MediaUpload::query()->create([
            'uuid' => $uuid, 'purpose' => 'product_image', 'target_type' => 'product', 'target_id' => $product->id,
            'disk' => 'r2', 'object_key' => 'products/'.$product->uuid.'/media-'.$uuid.'.png', 'original_filename' => 'x.png',
            'expected_mime_type' => 'image/png', 'expected_size_bytes' => $size, 'status' => 'pending',
            'expires_at' => $expiresAt ?? now()->addMinutes(5), 'created_by' => $adminId,
        ]);
    }
}
