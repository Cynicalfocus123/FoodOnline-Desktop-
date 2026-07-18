<?php

namespace App\Console\Commands;

use App\Services\Catalog\LegacyCategoryBackfill;
use Illuminate\Console\Command;

class BackfillLegacyCategories extends Command
{
    protected $signature = 'catalog:backfill-categories';
    protected $description = 'Insert only missing original FoodOnlines categories without changing existing records';

    public function handle(LegacyCategoryBackfill $backfill): int
    {
        $result = $backfill->run();
        $this->info("Category backfill complete: {$result['categories_created']} categories and {$result['aliases_created']} aliases created.");

        return self::SUCCESS;
    }
}
