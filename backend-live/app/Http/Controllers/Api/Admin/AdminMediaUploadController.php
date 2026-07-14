<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Media\CompleteMediaUploadRequest;
use App\Http\Requests\Admin\Media\CreateMediaUploadRequest;
use App\Http\Resources\Admin\AdminBrandResource;
use App\Http\Resources\Admin\AdminCategoryResource;
use App\Http\Resources\Admin\AdminProductMediaResource;
use App\Models\MediaUpload;
use App\Services\Media\ManagedMediaDeletionService;
use App\Services\Media\MediaUploadAuthorizationService;
use App\Services\Media\MediaUploadVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class AdminMediaUploadController extends Controller
{
    public function status(): JsonResponse
    {
        $disk = (string) config('foodonlines.media.disk', 'r2');
        $diskConfig = config("filesystems.disks.{$disk}", []);
        $configured = $disk !== 'r2' || (! empty($diskConfig['key']) && ! empty($diskConfig['secret']) && ! empty($diskConfig['bucket']) && ! empty($diskConfig['endpoint']));
        return response()->json(['data' => [
            'uploads_enabled' => (bool) config('foodonlines.media.uploads_enabled') && $configured, 'disk' => $disk,
            'direct_upload_supported' => ($diskConfig['driver'] ?? null) === 's3', 'public_base_url' => config('foodonlines.media.public_url'),
            'allowed_mime_types' => config('foodonlines.media.allowed_mime_types'), 'maximum_size_bytes' => config('foodonlines.media.max_size_bytes'),
            'upload_ttl_minutes' => (int) config('foodonlines.media.upload_ttl_minutes'), 'configured' => $configured,
        ]]);
    }

    public function store(CreateMediaUploadRequest $request, MediaUploadAuthorizationService $authorization): JsonResponse
    {
        $result = $authorization->authorize($request->validated(), $request->user());
        return response()->json([
            'upload_id' => $result['upload']->uuid, 'upload_url' => $result['upload_url'], 'method' => 'PUT',
            'headers' => $result['headers'], 'expires_at' => $result['upload']->expires_at->toIso8601String(),
        ], 201);
    }

    public function complete(CompleteMediaUploadRequest $request, MediaUpload $mediaUpload, MediaUploadVerificationService $verification): JsonResponse
    {
        $result = $verification->complete($mediaUpload, $request->validated(), $request->user());
        $resource = match ($result['type']) {
            'product_media' => new AdminProductMediaResource($result['target']),
            'brand' => new AdminBrandResource($result['target']),
            'category' => new AdminCategoryResource($result['target']),
        };
        return response()->json(['data' => $resource->resolve(), 'upload' => ['id' => $result['upload']->uuid, 'status' => 'finalized']]);
    }

    public function destroy(MediaUpload $mediaUpload, ManagedMediaDeletionService $deletion): JsonResponse
    {
        if ($mediaUpload->created_by !== request()->user()->id) { throw ValidationException::withMessages(['upload' => ['This upload belongs to another administrator.']]); }
        if ($mediaUpload->status !== 'pending') { throw ValidationException::withMessages(['upload' => ['Only pending uploads may be cancelled.']]); }
        $mediaUpload->forceFill(['status' => 'expired'])->save();
        $deletion->deletePath('r2://'.$mediaUpload->object_key);
        return response()->json(null, 204);
    }
}
