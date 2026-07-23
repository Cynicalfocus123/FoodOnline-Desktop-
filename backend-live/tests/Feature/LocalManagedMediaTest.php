<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\MediaUpload;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\ReturnRequest;
use App\Models\SupportTicket;
use App\Models\User;
use App\Models\UserApiToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class LocalManagedMediaTest extends TestCase
{
    use CreatesAdminTokens, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        config([
            'foodonlines.media.disk' => 'local',
            'foodonlines.media.local_disk' => 'public',
            'foodonlines.media.uploads_enabled' => true,
            'app.url' => 'https://api.foodonlines.test',
        ]);
    }

    public function test_capability_is_generic_and_brand_logo_lifecycle_uses_local_storage(): void
    {
        [, $token] = $this->adminToken();
        $capability = $this->withToken($token)->getJson('/api/v1/admin/media-storage/status')->assertOk()
            ->assertJsonPath('data.uploads_available', true)->assertJsonPath('data.strategy', 'multipart');
        foreach (['disk', 'bucket', 'endpoint', 'credentials', 'public_base_url'] as $internal) {
            $this->assertArrayNotHasKey($internal, $capability->json('data'));
        }

        $brand = $this->withToken($token)->postJson('/api/v1/admin/brands', ['name' => 'No Logo Brand', 'slug' => 'no-logo-brand'])->assertCreated()->json('data');
        $this->assertNull($brand['logo_url']);

        $first = $this->uploadAdmin($token, 'brand_logo', $brand['uuid'])->assertCreated();
        $firstPath = $first->json('data.logo_path');
        $this->assertStringStartsWith('local://media/brands/'.$brand['uuid'].'/logo-', $firstPath);
        $this->assertStringStartsWith('https://api.foodonlines.com/api/media/brands/', $first->json('data.logo_url'));
        Storage::disk('public')->assertExists(substr($firstPath, 8));
        $this->get('/api/media/'.substr($firstPath, strlen('local://media/')))->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');

        $second = $this->uploadAdmin($token, 'brand_logo', $brand['uuid'])->assertCreated();
        $secondPath = $second->json('data.logo_path');
        $this->assertNotSame($firstPath, $secondPath);
        Storage::disk('public')->assertMissing(substr($firstPath, 8));
        Storage::disk('public')->assertExists(substr($secondPath, 8));

        $this->withToken($token)->patchJson('/api/v1/admin/brands/'.$brand['uuid'], ['logo_path' => null])->assertOk()->assertJsonPath('data.logo_path', null);
        Storage::disk('public')->assertMissing(substr($secondPath, 8));
    }

    public function test_category_purposes_and_product_gallery_work_independently(): void
    {
        [, $token] = $this->adminToken();
        $category = Category::factory()->create();
        $purposes = [
            'category_image' => 'image_path',
            'category_icon' => 'icon_path',
            'category_desktop_banner' => 'desktop_banner_path',
            'category_mobile_banner' => 'mobile_banner_path',
        ];
        foreach ($purposes as $purpose => $field) {
            $response = $this->uploadAdmin($token, $purpose, $category->uuid)->assertCreated();
            $this->assertStringStartsWith('local://media/categories/'.$category->uuid.'/', $response->json('data.media.'.$field));
        }
        $this->assertNotNull($category->fresh()->image_path);
        $this->assertNotNull($category->fresh()->icon_path);
        $this->assertNotNull($category->fresh()->desktop_banner_path);
        $this->assertNotNull($category->fresh()->mobile_banner_path);

        $product = Product::factory()->create();
        $first = $this->uploadAdmin($token, 'product_image', $product->uuid)->assertCreated()->json('data');
        $second = $this->uploadAdmin($token, 'product_image', $product->uuid)->assertCreated()->json('data');
        $this->assertCount(2, $product->fresh()->media);
        $this->withToken($token)->postJson('/api/v1/admin/product-media/'.$second['id'].'/make-primary')->assertOk()->assertJsonPath('data.is_primary', true);
        $this->withToken($token)->postJson('/api/v1/admin/products/'.$product->uuid.'/media/reorder', ['media_ids' => [(int) $second['id'], (int) $first['id']]])->assertOk();
        $this->withToken($token)->deleteJson('/api/v1/admin/product-media/'.$second['id'])->assertNoContent();
        $this->assertTrue($product->fresh()->media()->whereKey($first['id'])->value('is_primary'));
        $this->withToken($token)->deleteJson('/api/v1/admin/product-media/'.$first['id'])->assertNoContent();
        $this->assertCount(0, $product->fresh()->media);
    }

    public function test_local_upload_rejects_invalid_files_and_cross_entity_replacement(): void
    {
        [, $token] = $this->adminToken();
        $product = Product::factory()->create();
        $other = Product::factory()->create();
        $media = $this->uploadAdmin($token, 'product_image', $other->uuid)->assertCreated()->json('data');

        $this->withToken($token)->withHeader('Accept', 'application/json')->post('/api/v1/admin/media-uploads/local', [
            'purpose' => 'product_image', 'target_uuid' => $product->uuid,
            'file' => UploadedFile::fake()->createWithContent('../../shell.php', '<?php echo "unsafe";'),
        ])->assertUnprocessable()->assertJsonValidationErrors('file');

        $this->withToken($token)->withHeader('Accept', 'application/json')->post('/api/v1/admin/media-uploads/local', [
            'purpose' => 'product_image', 'target_uuid' => $product->uuid,
            'file' => UploadedFile::fake()->create('oversized.png', 11000, 'image/png'),
        ])->assertUnprocessable()->assertJsonValidationErrors('file');

        config(['foodonlines.media.max_dimension' => 0]);
        $this->withToken($token)->withHeader('Accept', 'application/json')->post('/api/v1/admin/media-uploads/local', [
            'purpose' => 'product_image', 'target_uuid' => $product->uuid, 'file' => $this->image(),
        ])->assertUnprocessable()->assertJsonValidationErrors('file');
        config(['foodonlines.media.max_dimension' => 8000]);

        $this->withToken($token)->withHeader('Accept', 'application/json')->post('/api/v1/admin/media-uploads/local', [
            'purpose' => 'product_image', 'target_uuid' => $product->uuid, 'product_media_id' => $media['id'], 'file' => $this->image(),
        ])->assertUnprocessable()->assertJsonValidationErrors('product_media_id');
        $this->assertDatabaseCount('product_media', 1);
    }

    public function test_original_filename_cannot_control_the_managed_path(): void
    {
        [, $token] = $this->adminToken();
        $brand = Brand::factory()->create();
        $safe = $this->image();
        $file = new UploadedFile($safe->getRealPath(), '../../outside.png', 'image/png', null, true);
        $response = $this->withToken($token)->withHeader('Accept', 'application/json')->post('/api/v1/admin/media-uploads/local', [
            'purpose' => 'brand_logo', 'target_uuid' => $brand->uuid, 'file' => $file,
        ])->assertCreated();
        $path = $response->json('data.logo_path');
        $this->assertMatchesRegularExpression('#^local://media/brands/'.$brand->uuid.'/logo-[0-9a-f-]+\.png$#', $path);
        $this->assertStringNotContainsString('outside', $path);
        $this->assertStringNotContainsString('..', $path);
    }

    public function test_customer_review_return_and_support_media_are_owned_persistent_and_removable(): void
    {
        [$user, $token] = $this->customerToken();
        $product = Product::factory()->create();
        $review = ProductReview::query()->create(['uuid' => (string) Str::uuid(), 'product_id' => $product->id, 'user_id' => $user->id, 'rating' => 5, 'status' => 'pending']);
        $support = SupportTicket::query()->create(['uuid' => (string) Str::uuid(), 'ticket_number' => 'SUP-LOCAL-1', 'user_id' => $user->id, 'subject' => 'Local upload']);
        $order = Order::query()->create(['uuid' => (string) Str::uuid(), 'order_number' => 'ORD-LOCAL-1', 'user_id' => $user->id, 'actor_key' => 'user-'.$user->id, 'idempotency_key' => 'local-media', 'order_status' => 'delivered', 'payment_status' => 'paid', 'fulfillment_status' => 'delivered', 'currency_code' => 'USD', 'subtotal_minor' => 100, 'total_minor' => 100, 'payment_method_code' => 'cod', 'placed_at' => now(), 'delivered_at' => now()]);
        $return = ReturnRequest::query()->create(['uuid' => (string) Str::uuid(), 'return_number' => 'RET-LOCAL-1', 'order_id' => $order->id, 'user_id' => $user->id, 'status' => 'requested', 'requested_resolution' => 'refund', 'reason_code' => 'damaged', 'refund_amount_minor' => 0, 'currency_code' => 'USD', 'requested_at' => now()]);

        foreach ([['review_image', $review], ['return_evidence', $return], ['support_attachment', $support]] as [$purpose, $target]) {
            $response = $this->withToken($token)->withHeader('Accept', 'application/json')->post('/api/v1/account/media-uploads/local', ['purpose' => $purpose, 'target_uuid' => $target->uuid, 'file' => $this->image()])->assertCreated();
            $this->assertStringStartsWith('local://media/', $response->json('data.path'));
            $this->assertStringContainsString('/api/media/', $response->json('data.url'));
        }

        [$otherUser, $otherToken] = $this->customerToken();
        $this->withToken($otherToken)->withHeader('Accept', 'application/json')->post('/api/v1/account/media-uploads/local', ['purpose' => 'review_image', 'target_uuid' => $review->uuid, 'file' => $this->image()])->assertUnprocessable();
        $this->assertNotSame($user->id, $otherUser->id);

        $upload = MediaUpload::query()->where('purpose', 'support_attachment')->firstOrFail();
        $key = $upload->object_key;
        $this->withToken($token)->deleteJson('/api/v1/account/media-uploads/'.$upload->uuid)->assertNoContent();
        Storage::disk('public')->assertMissing($key);
        $this->assertDatabaseMissing('support_media', ['media_upload_id' => $upload->id]);
    }

    public function test_administrator_can_append_and_remove_operational_media(): void
    {
        [, $token] = $this->adminToken();
        $user = User::factory()->create(['role' => 'customer', 'status' => 'active']);
        $product = Product::factory()->create();
        $review = ProductReview::query()->create(['uuid' => (string) Str::uuid(), 'product_id' => $product->id, 'user_id' => $user->id, 'rating' => 4, 'status' => 'pending']);
        $support = SupportTicket::query()->create(['uuid' => (string) Str::uuid(), 'ticket_number' => 'SUP-ADMIN-1', 'user_id' => $user->id, 'subject' => 'Admin attachment']);
        $order = Order::query()->create(['uuid' => (string) Str::uuid(), 'order_number' => 'ORD-ADMIN-1', 'user_id' => $user->id, 'actor_key' => 'user-'.$user->id, 'idempotency_key' => 'admin-media', 'order_status' => 'delivered', 'payment_status' => 'paid', 'fulfillment_status' => 'delivered', 'currency_code' => 'USD', 'subtotal_minor' => 100, 'total_minor' => 100, 'payment_method_code' => 'cod', 'placed_at' => now(), 'delivered_at' => now()]);
        $return = ReturnRequest::query()->create(['uuid' => (string) Str::uuid(), 'return_number' => 'RET-ADMIN-1', 'order_id' => $order->id, 'user_id' => $user->id, 'status' => 'requested', 'requested_resolution' => 'refund', 'reason_code' => 'damaged', 'refund_amount_minor' => 0, 'currency_code' => 'USD', 'requested_at' => now()]);

        foreach ([['review_image', $review], ['return_evidence', $return], ['support_attachment', $support]] as [$purpose, $target]) {
            $response = $this->uploadAdmin($token, $purpose, $target->uuid)->assertCreated()
                ->assertJsonPath('data.url', fn ($url) => is_string($url) && str_contains($url, '/api/media/'))
                ->assertJsonMissingPath('data.upload')
                ->assertJsonMissingPath('data.object_key');
            $uploadUuid = $response->json('data.upload_uuid');
            $objectKey = MediaUpload::query()->where('uuid', $uploadUuid)->value('object_key');
            Storage::disk('public')->assertExists($objectKey);

            $this->withToken($token)->deleteJson('/api/v1/admin/media-uploads/'.$uploadUuid)->assertNoContent();
            Storage::disk('public')->assertMissing($objectKey);
            $this->assertDatabaseHas('media_uploads', ['uuid' => $uploadUuid, 'status' => 'deleted']);
        }
    }

    public function test_local_cleanup_is_idempotent_and_cannot_escape_managed_root(): void
    {
        $product = Product::factory()->create();
        $uuid = (string) Str::uuid();
        $upload = MediaUpload::query()->create(['uuid' => $uuid, 'purpose' => 'product_image', 'target_type' => 'product', 'target_id' => $product->id, 'disk' => 'public', 'object_key' => 'media/products/'.$product->uuid.'/media-'.$uuid.'.webp', 'original_filename' => 'x.webp', 'expected_mime_type' => 'image/webp', 'expected_size_bytes' => 1, 'status' => 'pending', 'expires_at' => now()->subMinute()]);
        Storage::disk('public')->put($upload->object_key, 'x');
        Storage::disk('public')->put('outside.txt', 'protected');
        $this->artisan('media:cleanup --limit=100')->assertSuccessful();
        $this->artisan('media:cleanup --limit=100')->assertSuccessful();
        Storage::disk('public')->assertMissing($upload->object_key);
        Storage::disk('public')->assertExists('outside.txt');
    }

    private function uploadAdmin(string $token, string $purpose, string $targetUuid)
    {
        return $this->withToken($token)->withHeader('Accept', 'application/json')->post('/api/v1/admin/media-uploads/local', [
            'purpose' => $purpose, 'target_uuid' => $targetUuid, 'file' => $this->image(),
        ]);
    }

    private function image(): UploadedFile
    {
        $bytes = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=');
        return UploadedFile::fake()->createWithContent('image.png', $bytes);
    }

    private function customerToken(): array
    {
        $user = User::factory()->create(['role' => 'customer', 'status' => 'active']);
        $plain = 'local-media-'.bin2hex(random_bytes(12));
        UserApiToken::query()->create(['user_id' => $user->id, 'name' => 'local-media-tests', 'token_hash' => hash('sha256', $plain), 'expires_at' => now()->addHour()]);
        return [$user, $plain];
    }
}
