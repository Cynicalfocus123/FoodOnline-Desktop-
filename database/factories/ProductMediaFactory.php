<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductMedia;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ProductMedia> */
class ProductMediaFactory extends Factory
{
    protected $model=ProductMedia::class;
    public function definition(): array { return ['product_id'=>Product::factory(),'path'=>'images/products/'.fake()->unique()->uuid().'.webp','alt_text'=>fake()->words(3,true),'image_fit'=>'contain','is_primary'=>false,'sort_order'=>0]; }
    public function primary(): static { return $this->state(fn()=>['is_primary'=>true,'sort_order'=>0]); }
    public function secondary(): static { return $this->state(fn()=>['is_primary'=>false,'sort_order'=>1]); }
}
