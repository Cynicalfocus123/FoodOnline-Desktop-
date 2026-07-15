<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Models\UserApiToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PhaseSevenOperationalCommerceTest extends TestCase
{
    use RefreshDatabase;

    public function test_favorites_and_saved_items_persist_for_an_authenticated_customer(): void
    {
        [$user, $token] = $this->customerToken();
        $product = Product::factory()->publishedReady()->create();
        $variant = $product->defaultVariant()->firstOrFail();

        $this->withToken($token)->postJson('/api/v1/account/favorites', ['product_uuid' => $product->uuid])->assertCreated();
        $this->withToken($token)->postJson('/api/v1/account/saved-items', ['variant_uuid' => $variant->uuid, 'quantity' => 3])->assertCreated();

        $this->withToken($token)->getJson('/api/v1/account/favorites')->assertOk()->assertJsonPath('data.0.product_uuid', $product->uuid);
        $this->withToken($token)->getJson('/api/v1/account/saved-items')->assertOk()->assertJsonPath('data.0.variant_uuid', $variant->uuid)->assertJsonPath('data.0.quantity', 3);
        $this->assertDatabaseHas('user_favorites', ['user_id' => $user->id, 'product_id' => $product->id]);
        $this->assertDatabaseHas('user_saved_items', ['user_id' => $user->id, 'product_variant_id' => $variant->id, 'quantity' => 3]);
    }

    public function test_review_requires_a_qualifying_delivered_purchase(): void
    {
        [, $token] = $this->customerToken();
        $product = Product::factory()->publishedReady()->create();

        $this->withToken($token)->postJson('/api/v1/catalog/products/'.$product->uuid.'/reviews', ['rating' => 5, 'body' => 'Not purchased yet.'])->assertUnprocessable();
    }

    public function test_customer_token_cannot_cross_into_admin_operations(): void
    {
        [, $token] = $this->customerToken();

        $this->withToken($token)->getJson('/api/v1/admin/operations')->assertUnauthorized();
    }

    private function customerToken(): array
    {
        $user = User::factory()->create(['account_type' => 'customer', 'role' => 'customer', 'status' => 'active']);
        $plain = 'phase-seven-'.bin2hex(random_bytes(18));
        UserApiToken::query()->create(['user_id' => $user->id, 'name' => 'phase-seven-tests', 'token_hash' => hash('sha256', $plain), 'expires_at' => now()->addHour()]);

        return [$user, $plain];
    }
}
