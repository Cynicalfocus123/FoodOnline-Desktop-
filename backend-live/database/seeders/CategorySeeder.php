<?php

namespace Database\Seeders;

use App\Services\Catalog\LegacyCategoryBackfill;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        app(LegacyCategoryBackfill::class)->run();
    }
}
