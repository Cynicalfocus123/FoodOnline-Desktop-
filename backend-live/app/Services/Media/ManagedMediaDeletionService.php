<?php

namespace App\Services\Media;

use App\Models\Brand;
use App\Models\Category;
use App\Models\MediaUpload;
use App\Models\ProductMedia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ManagedMediaDeletionService
{
    public function afterCommit(?string $path): void
    {
        if (! $this->objectKey($path)) { return; }
        DB::afterCommit(fn () => $this->deletePath($path));
    }

    public function deletePath(?string $path): bool
    {
        $key = $this->objectKey($path);
        if (! $key || $this->isReferenced($path)) { return false; }
        $upload = MediaUpload::query()->where('object_key', $key)->latest('id')->first();

        try {
            Storage::disk($upload?->disk ?: config('foodonlines.media.disk'))->delete($key);
            if ($upload && $upload->status !== 'finalized') { $upload->forceFill(['status' => 'deleted', 'cleanup_attempted_at' => now(), 'cleanup_error' => null])->save(); }
            return true;
        } catch (\Throwable) {
            if ($upload) { $upload->forceFill(['status' => 'cleanup_pending', 'cleanup_attempted_at' => now(), 'cleanup_error' => 'Managed object deletion failed.'])->save(); }
            return false;
        }
    }

    public function isReferenced(string $path): bool
    {
        if (ProductMedia::query()->where('path', $path)->exists() || Brand::query()->where('logo_path', $path)->exists()) { return true; }
        return Category::query()->where(fn ($query) => $query->where('image_path', $path)->orWhere('icon_path', $path)->orWhere('desktop_banner_path', $path)->orWhere('mobile_banner_path', $path))->exists();
    }

    public function objectKey(?string $path): ?string
    {
        if (! is_string($path) || ! str_starts_with($path, 'r2://')) { return null; }
        $key = substr($path, 5);
        return preg_match('#^(products|brands|categories)/[0-9a-f-]+/[a-z-]+-[0-9a-f-]+\.(jpg|png|webp)$#i', $key) === 1 ? $key : null;
    }
}
