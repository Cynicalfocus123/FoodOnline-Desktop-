<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Media\CompleteMediaUploadRequest;
use App\Http\Requests\Admin\Media\CreateMediaUploadRequest;
use App\Http\Requests\Media\LocalMediaUploadRequest;
use App\Http\Resources\Admin\AdminBrandResource;
use App\Http\Resources\Admin\AdminCategoryResource;
use App\Http\Resources\Admin\AdminProductMediaResource;
use App\Models\MediaUpload;
use App\Services\Media\ManagedMediaDeletionService;
use App\Services\Media\MediaUploadAuthorizationService;
use App\Services\Media\MediaUploadVerificationService;
use App\Services\Media\LocalMediaUploadService;
use App\Services\Media\MediaStorageManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class AdminMediaUploadController extends Controller
{
    public function status(MediaStorageManager $storage): JsonResponse
    {
        return response()->json(['data' => [
            'uploads_available' => $storage->uploadsAvailable(),
            'strategy' => $storage->strategy(),
            'accepted_types' => config('foodonlines.media.allowed_mime_types'),
            'maximum_size_bytes' => config('foodonlines.media.max_size_bytes'),
        ]]);
    }

    public function store(CreateMediaUploadRequest $request, MediaUploadAuthorizationService $authorization): JsonResponse
    {
        $result = $authorization->authorize($request->validated(), $request->user());
        return response()->json([
            'upload_id' => $result['upload']->uuid, 'strategy' => $result['strategy'], 'upload_url' => $result['upload_url'], 'method' => 'PUT',
            'headers' => $result['headers'], 'expires_at' => $result['upload']->expires_at->toIso8601String(),
        ], 201);
    }

    public function storeLocal(LocalMediaUploadRequest $request, LocalMediaUploadService $service): JsonResponse
    {
        $result = $service->uploadAdmin($request->validated(), $request->file('file'), $request->user());
        $data = $this->responseData($result['type'], $result['target']);

        return response()->json(['data' => $data, 'upload' => ['id' => $result['upload']->uuid, 'status' => 'finalized']], 201);
    }

    public function complete(CompleteMediaUploadRequest $request, MediaUpload $mediaUpload, MediaUploadVerificationService $verification): JsonResponse
    {
        $result = $verification->complete($mediaUpload, $request->validated(), $request->user());
        return response()->json(['data' => $this->responseData($result['type'], $result['target']), 'upload' => ['id' => $result['upload']->uuid, 'status' => 'finalized']]);
    }

    public function destroy(MediaUpload $mediaUpload, ManagedMediaDeletionService $deletion, MediaStorageManager $storage): JsonResponse
    {
        if ($mediaUpload->status === 'finalized' && in_array($mediaUpload->target_type, ['review', 'return', 'support'], true)) {
            $path = $storage->referenceForUpload($mediaUpload);
            DB::transaction(function () use ($mediaUpload, $deletion, $path): void {
                $mediaUpload->reviewMedia()->delete();
                $mediaUpload->returnMedia()->delete();
                $mediaUpload->supportMedia()->delete();
                $deletion->afterCommit($path);
            });
            return response()->json(null, 204);
        }
        if ($mediaUpload->created_by !== request()->user()->id) { throw ValidationException::withMessages(['upload' => ['This upload belongs to another administrator.']]); }
        if ($mediaUpload->status !== 'pending') { throw ValidationException::withMessages(['upload' => ['Only pending uploads may be cancelled.']]); }
        $mediaUpload->forceFill(['status' => 'expired'])->save();
        $deletion->deletePath($storage->referenceForUpload($mediaUpload));
        return response()->json(null, 204);
    }

    private function responseData(string $type, mixed $target): array
    {
        return match ($type) {
            'product_media' => (new AdminProductMediaResource($target))->resolve(),
            'brand' => (new AdminBrandResource($target))->resolve(),
            'category' => (new AdminCategoryResource($target))->resolve(),
            'review_media', 'return_media', 'support_media' => $target->load('upload')->toArray(),
        };
    }
}
