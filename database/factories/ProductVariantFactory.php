<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<ProductVariant> */
class ProductVariantFactory extends Factory
{
    protected $model=ProductVariant::class;
    public function definition(): array { return ['uuid'=>(string)Str::uuid(),'product_id'=>Product::factory(),'title'=>'Default','sku'=>'SKU-'.fake()->unique()->numerify('########'),'gtin'=>null,'size_label'=>'500 g','net_content_value'=>'500.000','net_content_unit'=>'g','pack_count'=>1,'package_type'=>'bag','price_amount'=>'9.99','compare_at_price_amount'=>null,'currency_code'=>'USD','availability_status'=>'in_stock','is_default'=>false,'is_active'=>true,'sort_order'=>0]; }
    public function default(): static { return $this->state(fn()=>['is_default'=>true,'is_active'=>true]); }
    public function inactive(): static { return $this->state(fn()=>['is_default'=>false,'is_active'=>false]); }
}
