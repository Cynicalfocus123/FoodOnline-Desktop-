<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductMedia;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Product> */
class ProductFactory extends Factory
{
    protected $model=Product::class;
    public function definition(): array { $name=fake()->unique()->words(3,true); return ['uuid'=>(string)Str::uuid(),'category_id'=>Category::factory(),'brand_id'=>null,'name'=>Str::title($name),'slug'=>Str::slug($name).'-'.fake()->unique()->numberBetween(1,999999),'description'=>fake()->sentence(),'country_of_origin_code'=>'US','storage_type'=>'ambient','status'=>'draft','is_featured'=>false,'published_at'=>null]; }
    public function archived(): static { return $this->state(fn()=>['status'=>'archived','published_at'=>null]); }
    public function publishedReady(): static
    {
        return $this->state(fn()=>['status'=>'published','published_at'=>now()])->afterCreating(function(Product $product):void {
            if(!$product->variants()->exists()){ProductVariant::factory()->for($product)->default()->create();}
            if(!$product->media()->exists()){ProductMedia::factory()->for($product)->primary()->create();}
        });
    }
}
