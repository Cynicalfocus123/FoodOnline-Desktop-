<?php

namespace App\Services\Referral;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

/**
 * Keeps referral rollout state isolated from core authentication and commerce.
 *
 * The referral migration is intentionally forward-only in production. Until it
 * is fully applied, referral endpoints return a controlled response while all
 * unrelated flows continue to operate normally.
 */
class ReferralSchema
{
    /** @var array<string, array<int, string>> */
    private const REQUIRED = [
        'referral_programs' => ['id', 'uuid', 'status', 'starts_at', 'ends_at'],
        'referral_codes' => ['id', 'uuid', 'user_id', 'code', 'status'],
        'referrals' => ['id', 'uuid', 'referral_program_id', 'referral_code_id', 'referrer_user_id', 'referred_user_id', 'status', 'registered_at', 'review_status'],
        'referral_rewards' => ['id', 'uuid', 'referral_id', 'beneficiary_user_id', 'qualifying_order_id', 'milestone', 'status', 'promotion_id', 'idempotency_key'],
    ];

    public function isReady(): bool
    {
        return $this->missing() === [];
    }

    /** @return array<int, string> */
    public function missing(): array
    {
        $missing = [];

        foreach (self::REQUIRED as $table => $columns) {
            if (! Schema::hasTable($table)) {
                $missing[] = $table;
                continue;
            }

            if (! Schema::hasColumns($table, $columns)) {
                $missing[] = $table.'.columns';
            }
        }

        return $missing;
    }

    public function unavailableResponse(Request $request): JsonResponse
    {
        Log::warning('Referral endpoint requested before the referral schema was ready.', [
            'method' => $request->method(),
            'route' => optional($request->route())->getName(),
            'missing' => $this->missing(),
        ]);

        return response()->json([
            'message' => 'Referral services are temporarily unavailable. Please try again later.',
        ], 503);
    }
}
