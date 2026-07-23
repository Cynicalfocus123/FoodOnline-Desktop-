<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class ProductNutritionFactsTest extends TestCase
{
    use CreatesAdminTokens, RefreshDatabase;

    public function test_admin_can_create_update_and_delete_nutrition_with_validation(): void
    {
        [, $token] = $this->adminToken(); $product = Product::factory()->create();
        $url = '/api/v1/admin/products/'.$product->uuid.'/nutrition-facts';
        $this->withToken($token)->putJson($url, ['serving_size'=>'1 cup','calories'=>100,'total_fat_g'=>2,'sodium_mg'=>120,'total_carbohydrate_g'=>18,'total_sugars_g'=>5,'protein_g'=>3])
            ->assertOk()->assertJsonPath('data.calories', 100);
        $this->withToken($token)->putJson($url, ['calories'=>110])->assertOk()->assertJsonPath('data.calories', 110);
        $this->withToken($token)->putJson($url, ['protein_g'=>-1])->assertUnprocessable()->assertJsonValidationErrors('protein_g');
        $this->withToken($token)->deleteJson($url)->assertNoContent();
        $this->assertNull($product->nutritionFacts()->first());
    }

    public function test_public_detail_returns_structured_nutrition_or_null(): void
    {
        $product = Product::factory()->publishedReady()->create();
        $this->getJson('/api/v1/catalog/products/'.$product->slug)->assertOk()->assertJsonPath('data.nutrition_facts', null);
        $product->nutritionFacts()->create(['serving_size'=>'1 cup','calories'=>100,'protein_g'=>3]);
        $this->getJson('/api/v1/catalog/products/'.$product->slug)->assertOk()->assertJsonPath('data.nutrition_facts.protein', '3 g');
    }
}
