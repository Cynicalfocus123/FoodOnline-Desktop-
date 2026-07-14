<?php

namespace App\Services\Media;

use Illuminate\Support\Facades\Storage;

class MediaUploadSigner
{
    /** @return array{url: string, headers: array<string, string>} */
    public function sign(string $disk, string $objectKey, \DateTimeInterface $expiresAt, string $mimeType): array
    {
        $signed = Storage::disk($disk)->temporaryUploadUrl($objectKey, $expiresAt, ['ContentType' => $mimeType]);

        return ['url' => $signed['url'], 'headers' => [...($signed['headers'] ?? []), 'Content-Type' => $mimeType]];
    }
}
