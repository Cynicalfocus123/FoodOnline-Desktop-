<?php

namespace App\Services\Catalog;

class CategoryMediaUrl
{
    public function make(?string $path): ?string
    {
        if ($path === null || $path === '' || str_starts_with(strtolower($path), 'r2://')) {
            return null;
        }

        if (preg_match('#^https://#i', $path) === 1) {
            return $path;
        }

        return rtrim((string) config('app.url'), '/').'/'.ltrim($path, '/');
    }
}
