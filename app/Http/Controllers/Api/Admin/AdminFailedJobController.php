<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class AdminFailedJobController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $jobs = DB::table('failed_jobs')->latest('failed_at')->limit(min(100, max(1, (int) $request->query('limit', 50))))->get(['uuid', 'queue', 'failed_at', 'exception']);

        return response()->json(['data' => $jobs->map(fn ($job) => [
            'uuid' => $job->uuid,
            'queue' => $job->queue,
            'failed_at' => $job->failed_at,
            'exception' => substr((string) $job->exception, 0, 1000),
        ]), 'count' => $jobs->count()]);
    }

    public function retry(string $uuid): JsonResponse
    {
        abort_unless((bool) DB::table('failed_jobs')->where('uuid', $uuid)->exists(), 404);
        Artisan::call('queue:retry', ['id' => [$uuid]]);

        return response()->json(['message' => 'Failed job queued for retry.', 'uuid' => $uuid]);
    }
}
