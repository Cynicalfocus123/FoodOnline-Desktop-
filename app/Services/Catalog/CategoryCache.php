<?php

namespace App\Services\Catalog;

use Illuminate\Support\Facades\Cache;

class CategoryCache
{
    private const VERSION_KEY = 'catalog:categories:version';

    public function version(): int
    {
        return (int) Cache::get(self::VERSION_KEY, 1);
    }

    public function key(string $suffix): string
    {
        return 'catalog:categories:v'.$this->version().':'.$suffix;
    }

    public function invalidate(): void
    {
        $next = $this->version() + 1;
        Cache::forever(self::VERSION_KEY, $next);
    }
}
