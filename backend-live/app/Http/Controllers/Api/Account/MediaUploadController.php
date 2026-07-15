<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Models\MediaUpload;
use App\Services\Media\MediaUploadAuthorizationService;
use App\Services\Media\MediaUploadVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaUploadController extends Controller
{
    public function store(Request $request, MediaUploadAuthorizationService $service): JsonResponse
    {
        $data = $request->validate(['purpose' => ['required', 'in:review_image,return_evidence,support_attachment'], 'target_uuid' => ['required', 'uuid'], 'original_filename' => ['required', 'string', 'max:255'], 'mime_type' => ['required', 'in:image/jpeg,image/png,image/webp'], 'size_bytes' => ['required', 'integer', 'min:1', 'max:10485760']]);
        $result = $service->authorizeCustomer($data, $request->user()); return response()->json(['upload_id' => $result['upload']->uuid, 'upload_url' => $result['upload_url'], 'method' => 'PUT', 'headers' => $result['headers'], 'expires_at' => $result['upload']->expires_at?->toIso8601String()], 201);
    }
    public function complete(Request $request, MediaUpload $mediaUpload, MediaUploadVerificationService $service): JsonResponse
    {
        $data = $request->validate(['alt_text' => ['nullable', 'string', 'max:180']]); $result = $service->complete($mediaUpload, $data, $request->user()); return response()->json(['upload' => ['id' => $result['upload']->uuid, 'status' => 'finalized'], 'data' => $result['target']]);
    }
}
