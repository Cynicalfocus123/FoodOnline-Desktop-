<?php

namespace App\Services\Media;

use App\Models\Brand;
use App\Models\Category;
use App\Models\MediaUpload;
use App\Models\Product;
use App\Models\ProductMedia;
use App\Models\ProductReview;
use App\Models\ReviewMedia;
use App\Models\ReturnMedia;
use App\Models\ReturnRequest;
use App\Models\SupportMedia;
use App\Models\SupportTicket;
use App\Models\User;
use App\Services\Catalog\ProductMediaService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class MediaUploadVerificationService
{
    public function __construct(
        private readonly ProductMediaService $productMedia,
        private readonly ManagedMediaDeletionService $deletion,
        private readonly MediaStorageManager $storage,
    ) {}

    /** @param array<string, mixed> $data @return array{type: string, target: mixed, upload: MediaUpload} */
    public function complete(MediaUpload $upload, array $data, User $admin): array
    {
        if ($upload->status === 'finalized') {
            return $this->finalizedResult($upload, $admin);
        }
        $this->assertCompletable($upload, $admin);
        $disk = Storage::disk($upload->disk);
        if (! $disk->exists($upload->object_key)) {
            throw ValidationException::withMessages(['upload' => ['The uploaded object was not found.']]);
        }

        $bytes = $disk->get($upload->object_key);
        $size = strlen($bytes);
        if ($size !== $upload->expected_size_bytes) {
            throw ValidationException::withMessages(['size_bytes' => ['The uploaded object size does not match the authorization.']]);
        }
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($bytes);
        if (! is_string($mime) || $mime !== $upload->expected_mime_type || ! in_array($mime, config('foodonlines.media.allowed_mime_types', []), true)) {
            throw ValidationException::withMessages(['mime_type' => ['The uploaded file signature is not an approved image type.']]);
        }
        $dimensions = @getimagesizefromstring($bytes);
        if (! is_array($dimensions) || empty($dimensions[0]) || empty($dimensions[1])) {
            throw ValidationException::withMessages(['upload' => ['The uploaded file is not a valid decodable image.']]);
        }
        $maximumDimension = (int) config('foodonlines.media.max_dimension', 8000);
        if ($dimensions[0] > $maximumDimension || $dimensions[1] > $maximumDimension) {
            throw ValidationException::withMessages(['upload' => ["Image dimensions may not exceed {$maximumDimension} by {$maximumDimension} pixels."]]);
        }

        return DB::transaction(function () use ($upload, $data, $mime, $size, $dimensions): array {
            $locked = MediaUpload::query()->whereKey($upload->id)->lockForUpdate()->firstOrFail();
            if ($locked->status !== 'pending' || $locked->expires_at->isPast()) {
                throw ValidationException::withMessages(['upload' => ['This upload authorization is no longer available.']]);
            }
            $path = $this->storage->referenceForUpload($locked);
            $oldPath = null;

            if ($locked->target_type === 'product') {
                $product = Product::query()->whereKey($locked->target_id)->lockForUpdate()->firstOrFail();
                if ($locked->product_media_id) {
                    $media = ProductMedia::query()->whereKey($locked->product_media_id)->where('product_id', $product->id)->firstOrFail();
                    $oldPath = $media->path;
                    $media = $this->productMedia->update($media, [
                        'path' => $path,
                        ...array_filter($data, fn ($key) => in_array($key, ['alt_text', 'image_fit', 'is_primary'], true), ARRAY_FILTER_USE_KEY),
                    ]);
                } else {
                    $media = $this->productMedia->create($product, [
                        'path' => $path, 'alt_text' => $data['alt_text'] ?? null, 'image_fit' => $data['image_fit'] ?? 'contain',
                        'is_primary' => (bool) ($data['is_primary'] ?? false), 'sort_order' => (int) ($product->media()->max('sort_order') ?? -1) + 1,
                    ]);
                }
                $target = $media;
                $type = 'product_media';
                $locked->product_media_id = $media->id;
            } elseif ($locked->target_type === 'review') {
                $review = ProductReview::query()->whereKey($locked->target_id)->lockForUpdate()->firstOrFail();
                $target = ReviewMedia::query()->create(['uuid' => (string) \Illuminate\Support\Str::uuid(), 'product_review_id' => $review->id, 'media_upload_id' => $locked->id, 'path' => $path, 'alt_text' => $data['alt_text'] ?? null, 'sort_order' => (int) ($review->media()->max('sort_order') ?? -1) + 1]);
                $type = 'review_media';
            } elseif ($locked->target_type === 'return') {
                $return = ReturnRequest::query()->whereKey($locked->target_id)->lockForUpdate()->firstOrFail();
                $target = ReturnMedia::query()->create(['uuid' => (string) \Illuminate\Support\Str::uuid(), 'return_request_id' => $return->id, 'media_upload_id' => $locked->id, 'path' => $path, 'alt_text' => $data['alt_text'] ?? null, 'sort_order' => (int) ($return->media()->max('sort_order') ?? -1) + 1]);
                $type = 'return_media';
            } elseif ($locked->target_type === 'support') {
                $ticket = SupportTicket::query()->whereKey($locked->target_id)->lockForUpdate()->firstOrFail();
                $target = SupportMedia::query()->create(['uuid' => (string) \Illuminate\Support\Str::uuid(), 'support_ticket_id' => $ticket->id, 'media_upload_id' => $locked->id, 'path' => $path, 'alt_text' => $data['alt_text'] ?? null, 'sort_order' => (int) ($ticket->media()->max('sort_order') ?? -1) + 1]);
                $type = 'support_media';
            } elseif ($locked->target_type === 'brand') {
                $target = Brand::query()->whereKey($locked->target_id)->lockForUpdate()->firstOrFail();
                $oldPath = $target->logo_path;
                $target->forceFill(['logo_path' => $path])->save();
                $type = 'brand';
            } else {
                $target = Category::query()->whereKey($locked->target_id)->lockForUpdate()->firstOrFail();
                $oldPath = $target->{$locked->target_field};
                $target->forceFill([$locked->target_field => $path])->save();
                $type = 'category';
            }

            $locked->forceFill([
                'actual_mime_type' => $mime, 'actual_size_bytes' => $size, 'width' => $dimensions[0], 'height' => $dimensions[1],
                'status' => 'finalized', 'finalized_at' => now(), 'cleanup_error' => null,
            ])->save();
            if ($oldPath && $oldPath !== $path) { $this->deletion->afterCommit($oldPath); }

            return ['type' => $type, 'target' => $target->fresh(), 'upload' => $locked->fresh()];
        });
    }

    private function assertCompletable(MediaUpload $upload, User $admin): void
    {
        if ($upload->created_by !== $admin->id) { throw ValidationException::withMessages(['upload' => ['This upload belongs to another administrator.']]); }
        if ($upload->status !== 'pending') { throw ValidationException::withMessages(['upload' => ['This upload has already been finalized or cancelled.']]); }
        if ($upload->expires_at->isPast()) {
            $upload->forceFill(['status' => 'expired'])->save();
            throw ValidationException::withMessages(['upload' => ['This upload authorization has expired.']]);
        }
    }

    /** @return array{type: string, target: mixed, upload: MediaUpload} */
    private function finalizedResult(MediaUpload $upload, User $admin): array
    {
        if ($upload->created_by !== $admin->id) {
            throw ValidationException::withMessages(['upload' => ['This upload belongs to another administrator.']]);
        }

        [$type, $target] = match ($upload->target_type) {
            'product' => ['product_media', ProductMedia::query()->findOrFail($upload->product_media_id)],
            'brand' => ['brand', Brand::query()->findOrFail($upload->target_id)],
            'category' => ['category', Category::query()->findOrFail($upload->target_id)],
            'review' => ['review_media', ReviewMedia::query()->where('media_upload_id', $upload->id)->firstOrFail()],
            'return' => ['return_media', ReturnMedia::query()->where('media_upload_id', $upload->id)->firstOrFail()],
            'support' => ['support_media', SupportMedia::query()->where('media_upload_id', $upload->id)->firstOrFail()],
            default => throw ValidationException::withMessages(['upload' => ['This upload cannot be completed.']]),
        };

        return ['type' => $type, 'target' => $target, 'upload' => $upload];
    }
}
