<?php

namespace Database\Factories;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Brand> */
class BrandFactory extends Factory
{
    protected $model=Brand::class;
    public function definition(): array { $name=fake()->unique()->company(); return ['uuid'=>(string)Str::uuid(),'name'=>$name,'slug'=>Str::slug($name).'-'.fake()->unique()->numberBetween(1,999999),'country_code'=>'US','is_active'=>true,'sort_order'=>0]; }
    public function inactive(): static { return $this->state(fn()=>['is_active'=>false]); }
}
