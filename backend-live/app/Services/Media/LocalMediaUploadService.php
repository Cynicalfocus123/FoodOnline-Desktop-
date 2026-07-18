<?php

namespace App\Services\Media;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class LocalMediaUploadService
{
    public function __construct(
        private readonly MediaStorageManager $storage,
        private readonly MediaUploadAuthorizationService $authorization,
        private readonly MediaUploadVerificationService $verification,
    ) {}

    /** @param array<string, mixed> $data */
    public function uploadAdmin(array $data, UploadedFile $file, User $user): array
    {
        return $this->upload($data, $file, $user, false);
    }

    /** @param array<string, mixed> $data */
    public function uploadCustomer(array $data, UploadedFile $file, User $user): array
    {
        return $this->upload($data, $file, $user, true);
    }

    /** @param array<string, mixed> $data */
    private function upload(array $data, UploadedFile $file, User $user, bool $customer): array
    {
        if ($this->storage->strategy() !== 'multipart' || ! $this->storage->uploadsAvailable()) {
            throw ValidationException::withMessages(['storage' => ['Image uploads are temporarily unavailable.']]);
        }

        $realPath = $file->getRealPath();
        $bytes = is_string($realPath) ? @file_get_contents($realPath) : false;
        if (! is_string($bytes) || $bytes === '') {
            throw ValidationException::withMessages(['file' => ['Upload failed. Check the file and try again.']]);
        }

        $size = strlen($bytes);
        $maximum = (int) config('foodonlines.media.max_size_bytes.'.$data['purpose'], 0);
        if ($size < 1 || $maximum < 1 || $size > $maximum) {
            throw ValidationException::withMessages(['file' => ['The image exceeds the allowed file size.']]);
        }

        $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($bytes);
        if (! is_string($mime) || ! in_array($mime, config('foodonlines.media.allowed_mime_types', []), true)) {
            throw ValidationException::withMessages(['file' => ['Upload a valid JPEG, PNG, or WebP image.']]);
        }

        $dimensions = @getimagesizefromstring($bytes);
        $maximumDimension = (int) config('foodonlines.media.max_dimension', 8000);
        if (! is_array($dimensions) || empty($dimensions[0]) || empty($dimensions[1])) {
            throw ValidationException::withMessages(['file' => ['The uploaded file is not a valid image.']]);
        }
        if ($dimensions[0] > $maximumDimension || $dimensions[1] > $maximumDimension) {
            throw ValidationException::withMessages(['file' => ["Image dimensions may not exceed {$maximumDimension} by {$maximumDimension} pixels."]]);
        }

        $authorizationData = [
            ...$data,
            'original_filename' => $file->getClientOriginalName() ?: 'image',
            'mime_type' => $mime,
            'size_bytes' => $size,
        ];
        $authorized = $customer
            ? $this->authorization->authorizeCustomer($authorizationData, $user)
            : $this->authorization->authorize($authorizationData, $user);
        $upload = $authorized['upload'];

        try {
            $written = Storage::disk($upload->disk)->put($upload->object_key, $bytes, ['visibility' => 'public']);
        } catch (\Throwable) {
            $written = false;
        }
        if (! $written) {
            $upload->forceFill(['status' => 'cleanup_pending', 'cleanup_error' => 'Managed object write failed.'])->save();
            throw ValidationException::withMessages(['file' => ['Upload failed. Check the file and try again.']]);
        }

        $metadata = array_filter($data, fn ($key) => in_array($key, ['alt_text', 'image_fit', 'is_primary'], true), ARRAY_FILTER_USE_KEY);

        try {
            return $this->verification->complete($upload->fresh(), $metadata, $user);
        } catch (\Throwable $error) {
            $disk = Storage::disk($upload->disk);
            $deleted = $disk->delete($upload->object_key);
            $cleanupPending = ! $deleted && $disk->exists($upload->object_key);
            $upload->forceFill([
                'status' => $cleanupPending ? 'cleanup_pending' : 'deleted',
                'cleanup_error' => $cleanupPending ? 'Managed object deletion failed.' : null,
                'cleanup_attempted_at' => now(),
            ])->save();
            throw $error;
        }
    }
}
