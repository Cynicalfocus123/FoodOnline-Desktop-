<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CategoryAlias;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['Paan Corner', 'paan-corner.jpg'],
            ['Dairy, Bread & Eggs', 'dairy-bread-eggs.jpg'],
            ['Fruits & Vegetables', 'fruits-vegetables.jpg'],
            ['Cold Drinks & Juices', 'cold-drinks-juices.jpg'],
            ['Snacks & Munchies', 'snacks-munchies.jpg'],
            ['Breakfast & Instant Food', 'breakfast-instant-food.jpg'],
            ['Sweet Tooth', 'sweet-tooth.jpg'],
            ['Bakery & Biscuits', 'bakery-biscuits.jpg'],
            ['Tea, Coffee & Milk Drinks', 'tea-coffee-milk-drinks.jpg'],
            ['Atta, Rice & Dal', 'atta-rice-dal.jpg'],
            ['Masala, Oil & More', 'masala-oil-more.jpg'],
            ['Sauces & Spreads', 'sauces-spreads.jpg'],
            ['Chicken, Meat & Fish', 'chicken-meat-fish.jpg'],
            ['Organic & Healthy Living', 'organic-healthy-living.jpg'],
            ['Vegan Foods', 'organic-healthy-living.jpg'],
            ['Frozen', 'frozen.jfif'],
        ];

        foreach ($categories as $order => [$name, $image]) {
            $slug = Str::slug($name);
            Category::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'uuid' => (string) (Category::query()->where('slug', $slug)->value('uuid') ?: Str::uuid()),
                    'parent_id' => null,
                    'name' => $name,
                    'status' => 'published',
                    'visibility' => 'public',
                    'sort_order' => $order,
                    'depth' => 0,
                    'path' => $slug,
                    'image_path' => 'assets/categories/'.$image,
                    'show_in_navigation' => true,
                    'show_on_homepage' => true,
                    'default_sort' => 'featured',
                    'robots_index' => true,
                    'robots_follow' => true,
                    'published_at' => Category::query()->where('slug', $slug)->value('published_at') ?: now(),
                ],
            );
        }

        $vegan = Category::query()->where('slug', 'vegan-foods')->firstOrFail();
        CategoryAlias::query()->updateOrCreate(
            ['alias_slug' => 'baby-care'],
            ['category_id' => $vegan->id, 'redirect_code' => 301, 'is_active' => true],
        );
    }
}
