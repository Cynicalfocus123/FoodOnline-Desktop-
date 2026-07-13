<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserAccountDeletionRequest;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminAccountDeletionRequestsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', Rule::in(['pending', 'reviewed', 'completed', 'cancelled'])],
        ]);

        $requests = UserAccountDeletionRequest::query()
            ->when($validated['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->orderByDesc('requested_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (UserAccountDeletionRequest $item): array => [
                'id' => $item->id,
                'user_id' => $item->user_id,
                'user_name' => $item->user_name,
                'user_email' => $item->user_email,
                'user_phone' => $item->user_phone,
                'reason' => $item->reason,
                'other_reason' => $item->other_reason,
                'status' => $item->status,
                'requested_at' => optional($item->requested_at)->toISOString(),
                'reviewed_at' => optional($item->reviewed_at)->toISOString(),
            ])
            ->values();

        return response()->json([
            'delete_account_requests' => $requests,
        ]);
    }

    public function update(Request $request, int $requestId): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['pending', 'reviewed', 'completed', 'cancelled'])],
        ]);

        $item = UserAccountDeletionRequest::query()->whereKey($requestId)->firstOrFail();
        $item->forceFill([
            'status' => (string) $validated['status'],
            'reviewed_at' => CarbonImmutable::now(),
        ])->save();

        return response()->json([
            'message' => 'Delete account request status updated.',
        ]);
    }
}

