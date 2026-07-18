<?php

namespace App\Services\Catalog;

use App\Models\Category;
use App\Models\CategoryAlias;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LegacyCategoryBackfill
{
    /** @return array{categories_created:int, aliases_created:int} */
    public function run(): array
    {
        return DB::transaction(function (): array {
            $created = 0;
            foreach ($this->categories() as $order => [$name, $slug, $image]) {
                if (Category::withTrashed()->where('slug', $slug)->exists()) {
                    continue;
                }

                Category::query()->create([
                    'uuid' => (string) Str::uuid(),
                    'parent_id' => null,
                    'name' => $name,
                    'slug' => $slug,
                    'status' => 'published',
                    'visibility' => 'public',
                    'sort_order' => $order,
                    'depth' => 0,
                    'path' => $slug,
                    'image_path' => 'assets/categories/'.$image,
                    'is_featured' => false,
                    'show_in_navigation' => true,
                    'show_on_homepage' => true,
                    'default_sort' => 'featured',
                    'robots_index' => true,
                    'robots_follow' => true,
                    'published_at' => now(),
                ]);
                $created++;
            }

            $aliasesCreated = 0;
            $vegan = Category::query()->where('slug', 'vegan-foods')->first();
            if ($vegan
                && ! Category::withTrashed()->where('slug', 'baby-care')->exists()
                && ! CategoryAlias::query()->where('alias_slug', 'baby-care')->exists()) {
                CategoryAlias::query()->create([
                    'category_id' => $vegan->id,
                    'alias_slug' => 'baby-care',
                    'redirect_code' => 301,
                    'is_active' => true,
                ]);
                $aliasesCreated = 1;
            }

            app(CategoryCache::class)->invalidate();

            return ['categories_created' => $created, 'aliases_created' => $aliasesCreated];
        });
    }

    /** @return array<int, array{string, string, string}> */
    public function categories(): array
    {
        return [
            ['Paan Corner', 'paan-corner', 'paan-corner.jpg'],
            ['Dairy, Bread & Eggs', 'dairy-bread-eggs', 'dairy-bread-eggs.jpg'],
            ['Fruits & Vegetables', 'fruits-vegetables', 'fruits-vegetables.jpg'],
            ['Cold Drinks & Juices', 'cold-drinks-juices', 'cold-drinks-juices.jpg'],
            ['Snacks & Munchies', 'snacks-munchies', 'snacks-munchies.jpg'],
            ['Breakfast & Instant Food', 'breakfast-instant-food', 'breakfast-instant-food.jpg'],
            ['Sweet Tooth', 'sweet-tooth', 'sweet-tooth.jpg'],
            ['Bakery & Biscuits', 'bakery-biscuits', 'bakery-biscuits.jpg'],
            ['Tea, Coffee & Milk Drinks', 'tea-coffee-milk-drinks', 'tea-coffee-milk-drinks.jpg'],
            ['Atta, Rice & Dal', 'atta-rice-dal', 'atta-rice-dal.jpg'],
            ['Masala, Oil & More', 'masala-oil-more', 'masala-oil-more.jpg'],
            ['Sauces & Spreads', 'sauces-spreads', 'sauces-spreads.jpg'],
            ['Chicken, Meat & Fish', 'chicken-meat-fish', 'chicken-meat-fish.jpg'],
            ['Organic & Healthy Living', 'organic-healthy-living', 'organic-healthy-living.jpg'],
            ['Vegan Foods', 'vegan-foods', 'organic-healthy-living.jpg'],
            ['Frozen', 'frozen', 'frozen.jfif'],
        ];
    }
}
