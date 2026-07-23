<?php

namespace Tests\Feature;

use App\Models\Promotion;
use App\Services\Commerce\PromotionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class AdminPromotionWorkflowTest extends TestCase
{
    use CreatesAdminTokens;
    use RefreshDatabase;

    public function test_code_is_the_only_admin_identifier_and_optional_amounts_are_null(): void
    {
        [, $token] = $this->adminToken();

        $created = $this->withToken($token)->postJson('/api/v1/admin/promo-codes', $this->payload('SAVE15'))
            ->assertCreated()
            ->assertJsonMissingPath('promotion.name')
            ->assertJsonPath('promotion.code', 'SAVE15')
            ->assertJsonPath('promotion.minimum_subtotal_minor', null)
            ->assertJsonPath('promotion.maximum_discount_minor', null);

        $promotion = Promotion::query()->where('code', 'SAVE15')->firstOrFail();
        $this->assertSame('SAVE15', $promotion->name);
        $this->assertNull($promotion->minimum_subtotal_minor);
        $this->assertNull($promotion->maximum_discount_minor);

        $this->withToken($token)->patchJson('/api/v1/admin/promo-codes/'.$created->json('promotion.uuid'), [...$this->payload('SAVE20'), 'discount_value' => 2000])
            ->assertOk()
            ->assertJsonMissingPath('promotion.name')
            ->assertJsonPath('promotion.code', 'SAVE20');
    }

    public function test_optional_discount_amounts_preserve_calculation_rules(): void
    {
        $service = app(PromotionService::class);
        $uncapped = Promotion::query()->create([...$this->modelValues('UNCAPPED'), 'discount_value' => 1500, 'maximum_discount_minor' => null]);
        $capped = Promotion::query()->create([...$this->modelValues('CAPPED'), 'discount_value' => 1500, 'maximum_discount_minor' => 200]);
        $fixed = Promotion::query()->create([...$this->modelValues('FIXED', 'fixed'), 'discount_value' => 1250, 'maximum_discount_minor' => null, 'currency_code' => 'USD']);

        $items = [['product_id' => 1, 'category_id' => 1, 'line_subtotal_minor' => 2000]];
        $this->assertSame(300, $service->evaluate($uncapped->code, $items, 2000, 'USD', null, null)['discount_minor']);
        $this->assertSame(200, $service->evaluate($capped->code, $items, 2000, 'USD', null, null)['discount_minor']);
        $this->assertSame(1250, $service->evaluate($fixed->code, $items, 2000, 'USD', null, null)['discount_minor']);
    }

    public function test_negative_optional_amounts_are_rejected_and_legacy_records_remain_updatable(): void
    {
        [, $token] = $this->adminToken();
        $this->withToken($token)->postJson('/api/v1/admin/promo-codes', [...$this->payload('NEGATIVE-MIN'), 'minimum_subtotal_minor' => -1])
            ->assertUnprocessable()->assertJsonValidationErrors('minimum_subtotal_minor');
        $this->withToken($token)->postJson('/api/v1/admin/promo-codes', [...$this->payload('NEGATIVE-MAX'), 'maximum_discount_minor' => -1])
            ->assertUnprocessable()->assertJsonValidationErrors('maximum_discount_minor');

        $legacy = Promotion::query()->create([...$this->modelValues('LEGACY'), 'name' => 'Legacy campaign name']);
        $this->withToken($token)->patchJson('/api/v1/admin/promo-codes/'.$legacy->uuid, [...$this->payload('LEGACY'), 'description' => 'Still editable'])
            ->assertOk()->assertJsonMissingPath('promotion.name')->assertJsonPath('promotion.description', 'Still editable');
        $this->assertSame('Legacy campaign name', $legacy->fresh()->name);
    }

    /** @return array<string, mixed> */
    private function payload(string $code): array
    {
        return ['code' => $code, 'discount_type' => 'percentage', 'discount_value' => 1000, 'active' => true, 'applies_to' => 'all'];
    }

    /** @return array<string, mixed> */
    private function modelValues(string $code, string $type = 'percentage'): array
    {
        return ['code' => $code, 'name' => $code, 'discount_type' => $type, 'discount_value' => 1000, 'minimum_subtotal_minor' => null, 'maximum_discount_minor' => null, 'active' => true, 'applies_to' => 'all'];
    }
}
