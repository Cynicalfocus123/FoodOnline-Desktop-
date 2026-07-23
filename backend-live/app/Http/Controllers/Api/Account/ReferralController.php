<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Models\ReferralProgram;
use App\Models\ReferralReward;
use App\Models\User;
use App\Services\Referral\ReferralCodeService;
use App\Services\Referral\ReferralSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function dashboard(Request $request, ReferralCodeService $codes, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) return $schema->unavailableResponse($request);
        $user = $this->customer($request);
        $code = $codes->ensure($user);
        $program = ReferralProgram::active();
        $referrals = $user->referralsMade()->with(['referred:id,first_name', 'rewards'])->latest('registered_at')->get();

        return response()->json([
            'program' => $this->programPayload($program),
            'invite' => $code ? [
                'code' => $code->code,
                'url' => rtrim((string) config('foodonlines.frontend_url', 'https://foodonlines.com'), '/').'/invite/'.$code->code,
            ] : null,
            'stats' => [
                'registered' => $referrals->count(),
                'first_qualified' => $referrals->whereNotNull('first_qualifying_order_id')->count(),
                'second_qualified' => $referrals->whereNotNull('second_qualifying_order_id')->count(),
                'earned_coupons' => $user->referralRewards()->where('status', 'issued')->count(),
            ],
            'recent_activity' => $referrals->take(5)->map(fn ($referral) => $this->activityPayload($referral))->values(),
        ]);
    }

    public function activity(Request $request, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) return $schema->unavailableResponse($request);
        $user = $this->customer($request);
        $page = $user->referralsMade()->with('referred:id,first_name')->latest('registered_at')->paginate(min(50, max(1, (int) $request->query('per_page', 10))));

        return response()->json([
            'data' => $page->getCollection()->map(fn ($referral) => $this->activityPayload($referral)),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()],
        ]);
    }

    public function coupons(Request $request, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) return $schema->unavailableResponse($request);
        $user = $this->customer($request);
        $page = $user->referralRewards()->with('promotion:id,uuid,code')->latest('issued_at')->paginate(min(50, max(1, (int) $request->query('per_page', 20))));

        return response()->json([
            'data' => $page->getCollection()->map(fn (ReferralReward $reward) => [
                'id' => $reward->uuid, 'milestone' => $reward->milestone, 'amount_minor' => $reward->amount_minor,
                'currency_code' => $reward->currency_code, 'status' => $reward->status, 'coupon_code' => $reward->promotion?->code,
                'expires_at' => $reward->expires_at?->toIso8601String(), 'issued_at' => $reward->issued_at?->toIso8601String(),
                'redeemed_at' => $reward->redeemed_at?->toIso8601String(),
            ]),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()],
        ]);
    }

    private function customer(Request $request): User
    {
        $user = $request->user();
        abort_unless($user && (($user->account_type ?: $user->role) === 'customer') && ! $user->staff_role, 403);

        return $user;
    }

    private function programPayload(?ReferralProgram $program): ?array
    {
        if (! $program) return null;

        return [
            'heading' => $program->customer_heading ?: 'Refer & Earn',
            'referrer_benefit_title' => $program->referrer_benefit_title,
            'referrer_benefit_copy' => $program->referrer_benefit_copy,
            'referee_benefit_title' => $program->referee_benefit_title,
            'referee_benefit_copy' => $program->referee_benefit_copy,
            'share_message' => $program->share_message,
            'terms_content' => $program->terms_content,
        ];
    }

    private function activityPayload($referral): array
    {
        $name = trim((string) ($referral->referred?->first_name ?? 'Friend'));

        return [
            'id' => $referral->uuid,
            'friend_name' => $name === '' ? 'Friend' : mb_substr($name, 0, 1).'.',
            'status' => $referral->status,
            'registered_at' => $referral->registered_at?->toIso8601String(),
            'first_qualified_at' => $referral->first_qualified_at?->toIso8601String(),
            'second_qualified_at' => $referral->second_qualified_at?->toIso8601String(),
        ];
    }
}
