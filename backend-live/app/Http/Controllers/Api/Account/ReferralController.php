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
        $user = $this->eligibleAccount($request, $codes);
        $code = $codes->ensure($user);
        $program = ReferralProgram::active();
        $referrals = $user->referralsMade();
        $recentActivity = $user->referralsMade()->with('referred:id,first_name,role')->latest('registered_at')->limit(5)->get();

        return response()->json([
            'program' => $this->programPayload($program),
            'invite' => $code ? [
                'code' => $code->code,
                'url' => rtrim((string) config('foodonlines.frontend_url', 'https://foodonlines.com'), '/').'/invite/'.$code->code,
            ] : null,
            'stats' => [
                'registered' => (clone $referrals)->count(),
                'first_qualified' => (clone $referrals)->whereNotNull('first_qualifying_order_id')->count(),
                'second_qualified' => (clone $referrals)->whereNotNull('second_qualifying_order_id')->count(),
                'earned_coupons' => $user->referralRewards()->where('status', 'issued')->count(),
            ],
            'recent_activity' => $recentActivity->map(fn ($referral) => $this->activityPayload($referral))->values(),
        ]);
    }

    public function activity(Request $request, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) return $schema->unavailableResponse($request);
        $user = $this->eligibleAccount($request, app(ReferralCodeService::class));
        $page = $user->referralsMade()->with('referred:id,first_name,role')->latest('registered_at')->paginate(min(50, max(1, (int) $request->query('per_page', 10))));

        return response()->json([
            'data' => $page->getCollection()->map(fn ($referral) => $this->activityPayload($referral)),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()],
        ]);
    }

    public function coupons(Request $request, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) return $schema->unavailableResponse($request);
        $user = $this->eligibleAccount($request, app(ReferralCodeService::class));
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

    private function eligibleAccount(Request $request, ReferralCodeService $codes): User
    {
        $user = $request->user();
        abort_unless($user && $codes->isEligible($user), 403);

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
            'friend_account_type' => strtolower((string) ($referral->referred?->account_type ?: $referral->referred?->role ?: 'account')),
            'status' => $referral->status,
            'registered_at' => $referral->registered_at?->toIso8601String(),
            'first_qualified_at' => $referral->first_qualified_at?->toIso8601String(),
            'second_qualified_at' => $referral->second_qualified_at?->toIso8601String(),
        ];
    }
}
