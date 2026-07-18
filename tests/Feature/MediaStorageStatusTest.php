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
            ->assertJsonStructure(['data' => ['uploads_available', 'strategy', 'accepted_types', 'maximum_size_bytes']]);
        $encoded = $response->getContent();
        $this->assertStringNotContainsString('secret', strtolower($encoded));
        $this->assertStringNotContainsString('access_key', strtolower($encoded));
        $this->assertStringNotContainsString('bucket', strtolower($encoded));
        $this->assertStringNotContainsString('endpoint', strtolower($encoded));
        $this->assertStringNotContainsString('disk', strtolower($encoded));

        config([
            'foodonlines.media.disk' => 'r2',
            'foodonlines.media.uploads_enabled' => true,
            'filesystems.disks.r2.key' => 'key',
            'filesystems.disks.r2.secret' => 'secret-value',
            'filesystems.disks.r2.bucket' => 'bucket-value',
            'filesystems.disks.r2.endpoint' => 'https://storage.example.test',
        ]);
        $direct = $this->withToken($token)->getJson('/api/v1/admin/media-storage/status')->assertOk()
            ->assertJsonPath('data.uploads_available', true)->assertJsonPath('data.strategy', 'direct')->getContent();
        $this->assertStringNotContainsString('secret-value', $direct);
        $this->assertStringNotContainsString('bucket-value', $direct);
        $this->assertStringNotContainsString('storage.example.test', $direct);
    }
}
