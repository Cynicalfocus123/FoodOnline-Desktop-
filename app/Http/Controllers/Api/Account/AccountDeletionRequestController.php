<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Models\UserAccountDeletionRequest;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountDeletionRequestController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'in:bad_experience,too_expensive,notifications,no_longer_need_account,no_longer_support_company,prefer_not_to_say,other'],
            'other_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validated['reason'] === 'other' && trim((string) ($validated['other_reason'] ?? '')) === '') {
            return response()->json([
                'message' => 'Please tell us your reason.',
                'errors' => [
                    'other_reason' => ['Tell us your reason...'],
                ],
            ], 422);
        }

        $user = $request->user();

        UserAccountDeletionRequest::query()->create([
            'user_id' => $user->id,
            'user_name' => trim((string) ($user->name ?: trim(($user->first_name ?? '').' '.($user->last_name ?? '')))),
            'user_email' => $user->email,
            'user_phone' => $user->contact_number ?: $user->phone,
            'reason' => (string) $validated['reason'],
            'other_reason' => $validated['reason'] === 'other' ? trim((string) ($validated['other_reason'] ?? '')) : null,
            'status' => 'pending',
            'requested_at' => CarbonImmutable::now(),
        ]);

        if ($user->status === 'active') {
            $user->forceFill([
                'status' => 'deletion_requested',
            ])->save();
        }

        return response()->json([
            'message' => 'Your account deletion request has been submitted.',
        ], 201);
    }
}

