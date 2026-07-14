<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Services\Media\MediaUploadSigner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class MediaUploadAuthorizationTest extends TestCase
{
    use CreatesAdminTokens, RefreshDatabase;

    public function test_disabled_invalid_and_valid_authorizations_are_safe(): void
    {
        [, $token] = $this->adminToken();
        $product = Product::factory()->create();
        $payload = ['purpose' => 'product_image', 'target_uuid' => $product->uuid, 'original_filename' => '../../front.png', 'mime_type' => 'image/png', 'size_bytes' => 100];
        $this->withToken($token)->postJson('/api/v1/admin/media-uploads', $payload)->assertUnprocessable()->assertJsonValidationErrors('storage');

        config(['foodonlines.media.uploads_enabled' => true]);
        $signer = Mockery::mock(MediaUploadSigner::class);
        $signer->shouldReceive('sign')->once()->andReturn(['url' => 'https://upload.example.test/signed', 'headers' => ['Content-Type' => 'image/png']]);
        $this->app->instance(MediaUploadSigner::class, $signer);
        $response = $this->withToken($token)->postJson('/api/v1/admin/media-uploads', $payload)->assertCreated()
            ->assertJsonPath('method', 'PUT')->assertJsonPath('headers.Content-Type', 'image/png');
        $upload = \App\Models\MediaUpload::query()->firstOrFail();
        $this->assertMatchesRegularExpression('#^products/'.$product->uuid.'/media-[0-9a-f-]+\.png$#', $upload->object_key);
        $this->assertStringNotContainsString('front', $upload->object_key);
        $this->assertSame($response->json('upload_id'), $upload->uuid);

        $this->withToken($token)->postJson('/api/v1/admin/media-uploads', [...$payload, 'purpose' => 'brand_logo'])->assertUnprocessable()->assertJsonValidationErrors('target_uuid');
        $this->withToken($token)->postJson('/api/v1/admin/media-uploads', [...$payload, 'mime_type' => 'image/svg+xml'])->assertUnprocessable()->assertJsonValidationErrors('mime_type');
    }
}
