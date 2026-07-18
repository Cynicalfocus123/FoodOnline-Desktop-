<?php

namespace App\Services\Catalog;

use App\Services\Media\MediaStorageManager;

class CategoryMediaUrl
{
    public function __construct(private readonly MediaStorageManager $storage) {}

    public function make(?string $path): ?string
    {
        return $this->storage->publicUrl($path);
    }
}
