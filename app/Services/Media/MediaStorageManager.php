<?php

namespace App\Services\Media;

use App\Models\MediaUpload;

class MediaStorageManager
{
    public const LOCAL = 'local';
    public const R2 = 'r2';

    public function provider(): string
    {
        $provider = strtolower(trim((string) config('foodonlines.media.disk', self::LOCAL)));

        return in_array($provider, [self::LOCAL, self::R2], true) ? $provider : self::LOCAL;
    }

    public function disk(): string
    {
        return $this->provider() === self::LOCAL
            ? (string) config('foodonlines.media.local_disk', 'public')
            : self::R2;
    }

    public function strategy(): string
    {
        return $this->provider() === self::LOCAL ? 'multipart' : 'direct';
    }

    public function uploadsAvailable(): bool
    {
        if (! config('foodonlines.media.uploads_enabled')) {
            return false;
        }

        $config = (array) config('filesystems.disks.'.$this->disk(), []);
        if ($this->provider() === self::LOCAL) {
            return ($config['driver'] ?? null) === 'local';
        }

        return ($config['driver'] ?? null) === 's3'
            && ! empty($config['key'])
            && ! empty($config['secret'])
            && ! empty($config['bucket'])
            && ! empty($config['endpoint']);
    }

    public function objectPrefix(string $prefix): string
    {
        return $this->provider() === self::LOCAL ? 'media/'.ltrim($prefix, '/') : ltrim($prefix, '/');
    }

    public function referenceForUpload(MediaUpload $upload): string
    {
        $provider = $upload->disk === self::R2 ? self::R2 : self::LOCAL;

        return $provider.'://'.ltrim($upload->object_key, '/');
    }

    /** @return array{provider: string, disk: string, key: string}|null */
    public function parseManagedReference(?string $path): ?array
    {
        if (! is_string($path) || preg_match('#^(local|r2)://(.+)$#i', $path, $matches) !== 1) {
            return null;
        }

        $provider = strtolower($matches[1]);
        $key = ltrim($matches[2], '/');
        if (str_contains($key, '..') || str_contains($key, '\\') || preg_match('#^/?(?:media/)?(products|brands|categories|reviews|returns|support)/[0-9a-f-]+/[a-z-]+-[0-9a-f-]+\.(jpg|png|webp)$#i', $key) !== 1) {
            return null;
        }

        return [
            'provider' => $provider,
            'disk' => $provider === self::R2 ? self::R2 : (string) config('foodonlines.media.local_disk', 'public'),
            'key' => $key,
        ];
    }

    public function publicUrl(?string $path): ?string
    {
        if (! is_string($path) || trim($path) === '') {
            return null;
        }

        $managed = $this->parseManagedReference($path);
        if ($managed) {
            if ($managed['provider'] === self::R2) {
                return rtrim((string) config('foodonlines.media.r2_public_url'), '/').'/'.$managed['key'];
            }

            return rtrim((string) config('foodonlines.media.local_public_url'), '/').'/'.ltrim(substr($managed['key'], 6), '/');
        }

        if (preg_match('#^https://#i', $path) === 1) {
            return $path;
        }

        return rtrim((string) config('app.url'), '/').'/'.ltrim($path, '/');
    }
}
