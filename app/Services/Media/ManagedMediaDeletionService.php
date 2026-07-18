<?php

namespace App\Services\Media;

use App\Models\Brand;
use App\Models\Category;
use App\Models\MediaUpload;
use App\Models\ProductMedia;
use App\Models\ReviewMedia;
use App\Models\ReturnMedia;
use App\Models\SupportMedia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ManagedMediaDeletionService
{
    public function __construct(private readonly MediaStorageManager $storage) {}

    public function afterCommit(?string $path): void
    {
        if (! $this->objectKey($path)) { return; }
        DB::afterCommit(fn () => $this->deletePath($path));
    }

    public function deletePath(?string $path): bool
    {
        $managed = $this->storage->parseManagedReference($path);
        if (! $managed || $this->isReferenced($path)) { return false; }
        $key = $managed['key'];
        $upload = MediaUpload::query()->where('object_key', $key)->latest('id')->first();

        try {
            $disk = Storage::disk($upload?->disk ?: $managed['disk']);
            $deleted = $disk->delete($key);
            if (! $deleted && $disk->exists($key)) {
                throw new \RuntimeException('Managed object deletion failed.');
            }
            if ($upload) { $upload->forceFill(['status' => 'deleted', 'cleanup_attempted_at' => now(), 'cleanup_error' => null])->save(); }
            return true;
        } catch (\Throwable) {
            if ($upload) { $upload->forceFill(['status' => 'cleanup_pending', 'cleanup_attempted_at' => now(), 'cleanup_error' => 'Managed object deletion failed.'])->save(); }
            return false;
        }
    }

    public function isReferenced(string $path): bool
    {
        if (ProductMedia::query()->where('path', $path)->exists() || ReviewMedia::query()->where('path', $path)->exists() || ReturnMedia::query()->where('path', $path)->exists() || SupportMedia::query()->where('path', $path)->exists() || Brand::query()->where('logo_path', $path)->exists()) { return true; }
        return Category::query()->where(fn ($query) => $query->where('image_path', $path)->orWhere('icon_path', $path)->orWhere('desktop_banner_path', $path)->orWhere('mobile_banner_path', $path))->exists();
    }

    public function objectKey(?string $path): ?string
    {
        return $this->storage->parseManagedReference($path)['key'] ?? null;
    }
}
