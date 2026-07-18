<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\OperationsHealthSnapshot;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminOperationsController extends Controller
{
    public function show(): JsonResponse
    {
        $media = app(\App\Services\Media\MediaStorageManager::class);
        return response()->json(['status' => 'ok', 'database' => 'configured', 'queue' => ['connection' => config('queue.default'), 'failed_jobs' => DB::table('failed_jobs')->count()], 'scheduler' => OperationsHealthSnapshot::query()->where('key', 'scheduler')->first(), 'reservation_cleanup' => OperationsHealthSnapshot::query()->where('key', 'inventory_cleanup')->first(), 'media_cleanup' => OperationsHealthSnapshot::query()->where('key', 'media_cleanup')->first(), 'media_uploads' => ['available' => $media->uploadsAvailable()], 'smtp_configured' => (bool) config('mail.mailers.smtp.host')]);
    }
}
