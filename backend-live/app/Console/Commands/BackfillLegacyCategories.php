<?php

namespace App\Console\Commands;

use App\Services\Catalog\LegacyCategoryBackfill;
use Illuminate\Console\Command;

class BackfillLegacyCategories extends Command
{
    protected $signature = 'catalog:backfill-categories';
    protected $description = 'Restore existing categories and insert only missing original FoodOnlines categories';

    public function handle(LegacyCategoryBackfill $backfill): int
    {
        $result = $backfill->run();
        $this->info("Category backfill complete: {$result['categories_restored']} categories restored, {$result['categories_created']} categories created, and {$result['aliases_created']} aliases created.");

        return self::SUCCESS;
    }
}
