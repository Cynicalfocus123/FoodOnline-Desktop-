<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Category> */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);
        $slug = Str::slug($name).'-'.fake()->unique()->numberBetween(1000, 999999);

        return [
            'uuid' => (string) Str::uuid(),
            'parent_id' => null,
            'name' => Str::title($name),
            'slug' => $slug,
            'description' => fake()->sentence(),
            'status' => 'published',
            'visibility' => 'public',
            'sort_order' => 0,
            'depth' => 0,
            'path' => $slug,
            'is_featured' => false,
            'show_in_navigation' => true,
            'show_on_homepage' => true,
            'default_sort' => 'featured',
            'robots_index' => true,
            'robots_follow' => true,
            'published_at' => now(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (): array => ['status' => 'draft', 'published_at' => null]);
    }

    public function archived(): static
    {
        return $this->state(fn (): array => ['status' => 'archived', 'published_at' => null, 'show_in_navigation' => false, 'show_on_homepage' => false]);
    }

    public function childOf(Category $parent): static
    {
        return $this->state(function (array $attributes) use ($parent): array {
            $slug = (string) $attributes['slug'];
            return ['parent_id' => $parent->id, 'depth' => $parent->depth + 1, 'path' => $parent->path.'/'.$slug];
        });
    }
}
