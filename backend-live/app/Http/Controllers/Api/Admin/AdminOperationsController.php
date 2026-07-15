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
        $disk = (string) config('foodonlines.media.disk', 'r2'); $r2 = config('filesystems.disks.r2', []);
        return response()->json(['status' => 'ok', 'database' => 'configured', 'queue' => ['connection' => config('queue.default'), 'failed_jobs' => DB::table('failed_jobs')->count()], 'scheduler' => OperationsHealthSnapshot::query()->where('key', 'scheduler')->first(), 'reservation_cleanup' => OperationsHealthSnapshot::query()->where('key', 'inventory_cleanup')->first(), 'media_cleanup' => OperationsHealthSnapshot::query()->where('key', 'media_cleanup')->first(), 'r2' => ['configured' => (bool) ($r2['key'] ?? null) && (bool) ($r2['secret'] ?? null) && (bool) ($r2['bucket'] ?? null), 'public_url_configured' => (bool) config('foodonlines.media.public_url')], 'smtp_configured' => (bool) config('mail.mailers.smtp.host')]);
    }
}
