<?php

namespace App\Services\Media;

use App\Models\Brand;
use App\Models\Category;
use App\Models\MediaUpload;
use App\Models\Product;
use App\Models\ProductMedia;
use App\Models\ProductReview;
use App\Models\ReturnRequest;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MediaUploadAuthorizationService
{
    public function __construct(private readonly MediaUploadSigner $signer) {}

    /** @param array<string, mixed> $data @return array{upload: MediaUpload, upload_url: string, headers: array<string, string>} */
    public function authorize(array $data, User $admin): array
    {
        if (! config('foodonlines.media.uploads_enabled')) {
            throw ValidationException::withMessages(['storage' => ['Media uploads are currently unavailable.']]);
        }

        [$targetType, $target, $field, $prefix] = $this->resolveTarget($data['purpose'], $data['target_uuid']);
        $productMedia = null;

        if ($data['purpose'] === 'product_image') {
            if (! empty($data['product_media_id'])) {
                $productMedia = ProductMedia::query()->whereKey($data['product_media_id'])->where('product_id', $target->id)->first();
                if (! $productMedia) {
                    throw ValidationException::withMessages(['product_media_id' => ['The image does not belong to the selected product.']]);
                }
            } elseif ($target->media()->count() >= 12) {
                throw ValidationException::withMessages(['target_uuid' => ['A product may have at most 12 images.']]);
            }
        }

        $mime = strtolower($data['mime_type']);
        $maximum = (int) config("foodonlines.media.max_size_bytes.{$data['purpose']}", 0);
        if (! in_array($mime, config('foodonlines.media.allowed_mime_types', []), true)) {
            throw ValidationException::withMessages(['mime_type' => ['Upload a JPEG, PNG, or WebP image.']]);
        }
        if ((int) $data['size_bytes'] < 1 || (int) $data['size_bytes'] > $maximum) {
            throw ValidationException::withMessages(['size_bytes' => ["The image may not exceed {$maximum} bytes."]]);
        }

        $uuid = (string) Str::uuid();
        $extension = match ($mime) { 'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp' };
        $objectKey = "{$prefix}-{$uuid}.{$extension}";
        $expiresAt = now()->addMinutes(max(1, (int) config('foodonlines.media.upload_ttl_minutes', 5)));
        $disk = (string) config('foodonlines.media.disk', 'r2');
        $upload = MediaUpload::query()->create([
            'uuid' => $uuid, 'purpose' => $data['purpose'], 'target_type' => $targetType, 'target_id' => $target->id,
            'target_field' => $field, 'product_media_id' => $productMedia?->id, 'disk' => $disk, 'object_key' => $objectKey,
            'original_filename' => basename(str_replace('\\', '/', $data['original_filename'])), 'expected_mime_type' => $mime,
            'expected_size_bytes' => (int) $data['size_bytes'], 'status' => 'pending', 'expires_at' => $expiresAt,
            'created_by' => $admin->id,
        ]);

        try {
            $signed = $this->signer->sign($disk, $objectKey, $expiresAt, $mime);
        } catch (\Throwable) {
            $upload->forceFill(['status' => 'deleted', 'cleanup_error' => 'Upload authorization could not be created.'])->save();
            throw ValidationException::withMessages(['storage' => ['Media storage could not authorize the upload. Try again later.']]);
        }

        return ['upload' => $upload, 'upload_url' => $signed['url'], 'headers' => $signed['headers']];
    }

    public function authorizeCustomer(array $data, User $user): array
    {
        if (! config('foodonlines.media.uploads_enabled')) { throw ValidationException::withMessages(['storage' => ['Media uploads are currently unavailable.']]); }
        [$targetType, $target, $prefix, $limit] = match ($data['purpose']) {
            'review_image' => ['review', ProductReview::query()->where('uuid', $data['target_uuid'])->where('user_id', $user->id)->first(), 'reviews/'.$data['target_uuid'].'/image', 5],
            'return_evidence' => ['return', ReturnRequest::query()->where('uuid', $data['target_uuid'])->where('user_id', $user->id)->first(), 'returns/'.$data['target_uuid'].'/evidence', 8],
            'support_attachment' => ['support', SupportTicket::query()->where('uuid', $data['target_uuid'])->where('user_id', $user->id)->first(), 'support/'.$data['target_uuid'].'/attachment', 5],
            default => throw ValidationException::withMessages(['purpose' => ['Unsupported customer media purpose.']]),
        };
        if (! $target) { throw ValidationException::withMessages(['target_uuid' => ['The media target was not found.']]); }
        $existing = match ($targetType) { 'review' => $target->media()->count(), 'return' => $target->media()->count(), default => $target->media()->count() };
        if ($existing >= $limit) { throw ValidationException::withMessages(['target_uuid' => ['The media limit for this target has been reached.']]); }
        $mime = strtolower($data['mime_type']); $maximum = $data['purpose'] === 'return_evidence' ? 10 * 1024 * 1024 : 8 * 1024 * 1024;
        if (! in_array($mime, config('foodonlines.media.allowed_mime_types', []), true) || (int) $data['size_bytes'] > $maximum) { throw ValidationException::withMessages(['size_bytes' => ['This image is not an approved size or type.']]); }
        $extension = match ($mime) { 'image/jpeg' => 'jpg', 'image/png' => 'png', default => 'webp' }; $uuid = (string) Str::uuid(); $expiresAt = now()->addMinutes(max(1, (int) config('foodonlines.media.upload_ttl_minutes', 5))); $disk = (string) config('foodonlines.media.disk', 'r2');
        $upload = MediaUpload::query()->create(['uuid' => $uuid, 'purpose' => $data['purpose'], 'target_type' => $targetType, 'target_id' => $target->id, 'disk' => $disk, 'object_key' => $prefix.'-'.$uuid.'.'.$extension, 'original_filename' => basename(str_replace('\\', '/', $data['original_filename'])), 'expected_mime_type' => $mime, 'expected_size_bytes' => (int) $data['size_bytes'], 'status' => 'pending', 'expires_at' => $expiresAt, 'created_by' => $user->id]);
        try { $signed = $this->signer->sign($disk, $upload->object_key, $expiresAt, $mime); } catch (\Throwable) { $upload->update(['status' => 'deleted']); throw ValidationException::withMessages(['storage' => ['Media storage could not authorize the upload.']]); }
        return ['upload' => $upload, 'upload_url' => $signed['url'], 'headers' => $signed['headers']];
    }

    /** @return array{string, Category|Brand|Product, ?string, string} */
    private function resolveTarget(string $purpose, string $uuid): array
    {
        return match ($purpose) {
            'product_image' => $this->target('product', Product::query()->where('uuid', $uuid)->first(), null, "products/{$uuid}/media"),
            'brand_logo' => $this->target('brand', Brand::query()->where('uuid', $uuid)->first(), 'logo_path', "brands/{$uuid}/logo"),
            'category_image' => $this->target('category', Category::query()->where('uuid', $uuid)->first(), 'image_path', "categories/{$uuid}/image"),
            'category_icon' => $this->target('category', Category::query()->where('uuid', $uuid)->first(), 'icon_path', "categories/{$uuid}/icon"),
            'category_desktop_banner' => $this->target('category', Category::query()->where('uuid', $uuid)->first(), 'desktop_banner_path', "categories/{$uuid}/desktop-banner"),
            'category_mobile_banner' => $this->target('category', Category::query()->where('uuid', $uuid)->first(), 'mobile_banner_path', "categories/{$uuid}/mobile-banner"),
            default => throw ValidationException::withMessages(['purpose' => ['Unsupported media purpose.']]),
        };
    }

    /** @return array{string, Category|Brand|Product, ?string, string} */
    private function target(string $type, mixed $target, ?string $field, string $prefix): array
    {
        if (! $target) { throw ValidationException::withMessages(['target_uuid' => ['The media target was not found.']]); }
        return [$type, $target, $field, $prefix];
    }
}
