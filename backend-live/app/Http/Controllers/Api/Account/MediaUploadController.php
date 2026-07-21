<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Models\MediaUpload;
use App\Services\Media\MediaUploadAuthorizationService;
use App\Services\Media\MediaUploadVerificationService;
use App\Http\Requests\Media\LocalMediaUploadRequest;
use App\Services\Media\LocalMediaUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\Media\ManagedMediaDeletionService;
use App\Services\Media\MediaStorageManager;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MediaUploadController extends Controller
{
    public function status(MediaStorageManager $storage): JsonResponse
    {
        return response()->json(['data' => [
            'uploads_available' => $storage->uploadsAvailable(),
            'strategy' => $storage->strategy(),
            'accepted_types' => config('foodonlines.media.allowed_mime_types'),
            'maximum_size_bytes' => config('foodonlines.media.max_size_bytes'),
        ]])->header('Cache-Control', 'no-store');
    }

    public function store(Request $request, MediaUploadAuthorizationService $service): JsonResponse
    {
        $data = $request->validate(['purpose' => ['required', 'in:review_image,return_evidence,support_attachment'], 'target_uuid' => ['required', 'uuid'], 'original_filename' => ['required', 'string', 'max:255'], 'mime_type' => ['required', 'in:image/jpeg,image/png,image/webp'], 'size_bytes' => ['required', 'integer', 'min:1', 'max:10485760']]);
        $result = $service->authorizeCustomer($data, $request->user()); return response()->json(['upload_id' => $result['upload']->uuid, 'upload_url' => $result['upload_url'], 'method' => 'PUT', 'headers' => $result['headers'], 'expires_at' => $result['upload']->expires_at?->toIso8601String()], 201);
    }
    public function complete(Request $request, MediaUpload $mediaUpload, MediaUploadVerificationService $service): JsonResponse
    {
        $data = $request->validate(['alt_text' => ['nullable', 'string', 'max:180']]); $result = $service->complete($mediaUpload, $data, $request->user()); return response()->json(['upload' => ['id' => $result['upload']->uuid, 'status' => 'finalized'], 'data' => $result['target']]);
    }

    public function storeLocal(LocalMediaUploadRequest $request, LocalMediaUploadService $service): JsonResponse
    {
        $allowed = ['review_image', 'return_evidence', 'support_attachment'];
        if (! in_array($request->validated('purpose'), $allowed, true)) {
            throw ValidationException::withMessages(['purpose' => ['Unsupported media purpose.']]);
        }
        $result = $service->uploadCustomer($request->validated(), $request->file('file'), $request->user());

        return response()->json(['upload' => ['id' => $result['upload']->uuid, 'status' => 'finalized'], 'data' => $result['target']], 201);
    }

    public function destroy(Request $request, MediaUpload $mediaUpload, ManagedMediaDeletionService $deletion, MediaStorageManager $storage): JsonResponse
    {
        if ($mediaUpload->created_by !== $request->user()->id || $mediaUpload->status !== 'finalized') {
            throw ValidationException::withMessages(['upload' => ['This image cannot be removed.']]);
        }

        $path = $storage->referenceForUpload($mediaUpload);
        DB::transaction(function () use ($mediaUpload, $deletion, $path): void {
            $mediaUpload->reviewMedia()->delete();
            $mediaUpload->returnMedia()->delete();
            $mediaUpload->supportMedia()->delete();
            $deletion->afterCommit($path);
        });

        return response()->json(null, 204);
    }
}
