<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class MediaStorageStatusTest extends TestCase
{
    use CreatesAdminTokens, RefreshDatabase;

    public function test_status_is_protected_and_contains_no_credentials(): void
    {
        $this->getJson('/api/v1/admin/media-storage/status')->assertUnauthorized();
        [, $token] = $this->adminToken();
        $response = $this->withToken($token)->getJson('/api/v1/admin/media-storage/status')->assertOk()
            ->assertJsonStructure(['data' => ['uploads_enabled', 'disk', 'direct_upload_supported', 'public_base_url', 'allowed_mime_types', 'maximum_size_bytes', 'upload_ttl_minutes', 'configured']]);
        $encoded = $response->getContent();
        $this->assertStringNotContainsString('secret', strtolower($encoded));
        $this->assertStringNotContainsString('access_key', strtolower($encoded));
    }
}
