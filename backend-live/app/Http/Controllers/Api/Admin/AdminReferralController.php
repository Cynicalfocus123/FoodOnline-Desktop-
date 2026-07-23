<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Referral;
use App\Models\ReferralProgram;
use App\Models\ReferralReward;
use App\Services\Referral\ReferralCodeService;
use App\Services\Referral\ReferralRewardService;
use App\Services\Referral\ReferralSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminReferralController extends Controller
{
    public function index(Request $request, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) return $schema->unavailableResponse($request);
        $query = Referral::query()->with(['code', 'referrer:id,uuid,name,email', 'referred:id,uuid,name,email', 'rewards.promotion']);
        if ($request->filled('status')) $query->where('status', $request->query('status'));
        if ($request->filled('review_status')) $query->where('review_status', $request->query('review_status'));
        if ($request->filled('code')) $query->whereHas('code', fn ($q) => $q->where('code', 'like', '%'.$request->query('code').'%'));
        if ($request->filled('search')) {
            $search = '%'.$request->query('search').'%';
            $query->where(fn ($q) => $q->whereHas('referrer', fn ($u) => $u->where('email', 'like', $search)->orWhere('name', 'like', $search))
                ->orWhereHas('referred', fn ($u) => $u->where('email', 'like', $search)->orWhere('name', 'like', $search)));
        }
        $page = $query->latest('registered_at')->paginate(min(100, max(1, (int) $request->query('per_page', 25))));

        return response()->json([
            'data' => $page->getCollection()->map(fn (Referral $referral) => $this->payload($referral)),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()],
            'summary' => [
                'registered' => Referral::query()->where('status', 'registered')->count(),
                'active' => Referral::query()->where('status', 'active')->count(),
                'completed' => Referral::query()->where('status', 'completed')->count(),
                'under_review' => Referral::query()->where('review_status', 'under_review')->count(),
            ],
        ]);
    }

    public function show(Request $request, string $referral, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) return $schema->unavailableResponse($request);
        $referral = $this->findReferral($referral);
        return response()->json(['referral' => $this->payload($referral->load(['program', 'code', 'referrer', 'referred', 'firstQualifyingOrder', 'secondQualifyingOrder', 'rewards.promotion']))]);
    }

    public function action(Request $request, string $referral, ReferralCodeService $codes, ReferralRewardService $rewards, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) return $schema->unavailableResponse($request);
        $referral = $this->findReferral($referral);
        $values = $request->validate(['action' => ['required', Rule::in(['review', 'approve', 'disqualify', 'restore', 'revoke_reward', 'disable_code'])],
            'reason' => ['nullable', 'string', 'max:500'], 'reward_id' => ['nullable', 'uuid']]);
        $before = $referral->load(['code', 'rewards.promotion'])->toArray();

        DB::transaction(function () use ($values, $request, $referral, $codes, $rewards): void {
            $referral->refresh();
            $action = $values['action'];
            if ($action === 'review') $referral->update(['status' => 'under_review', 'review_status' => 'under_review', 'reviewed_by' => $request->user()->id, 'reviewed_at' => now()]);
            if ($action === 'approve') $referral->update(['status' => $referral->first_qualifying_order_id ? 'active' : 'registered', 'review_status' => 'clear', 'reviewed_by' => $request->user()->id, 'reviewed_at' => now()]);
            if ($action === 'disqualify') $referral->update(['status' => 'disqualified', 'review_status' => 'disqualified', 'disqualified_at' => now(), 'disqualification_reason' => $values['reason'] ?? 'Disqualified by administrator.', 'reviewed_by' => $request->user()->id, 'reviewed_at' => now()]);
            if ($action === 'restore') $referral->update(['status' => $referral->first_qualifying_order_id ? 'active' : 'registered', 'review_status' => 'clear', 'disqualified_at' => null, 'disqualification_reason' => null, 'reviewed_by' => $request->user()->id, 'reviewed_at' => now()]);
            if ($action === 'disable_code') $codes->disable($referral->code);
            if ($action === 'revoke_reward') {
                $reward = $referral->rewards()->where('uuid', $values['reward_id'] ?? '')->lockForUpdate()->firstOrFail();
                if ($reward->status === 'issued') {
                    $reward->update(['status' => 'revoked', 'revoked_at' => now(), 'revoked_by' => $request->user()->id, 'revocation_reason' => $values['reason'] ?? 'Revoked by administrator.']);
                    $reward->promotion?->update(['active' => false, 'archived_at' => now()]);
                }
            }
        }, 3);
        $this->audit($request, 'referral.'.$values['action'], $referral, $before);

        return response()->json(['referral' => $this->payload($referral->fresh()->load(['program', 'code', 'referrer', 'referred', 'rewards.promotion']))]);
    }

    public function settings(Request $request, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) return $schema->unavailableResponse($request);
        return response()->json(['program' => ReferralProgram::query()->latest('id')->first()]);
    }

    public function updateSettings(Request $request, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) return $schema->unavailableResponse($request);
        $program = ReferralProgram::query()->latest('id')->firstOrFail();
        $values = $request->validate([
            'status' => ['sometimes', Rule::in(['draft', 'active', 'paused', 'ended'])],
            'currency_code' => ['sometimes', 'string', 'size:3'],
            'referrer_first_reward_minor' => ['sometimes', 'integer', 'min:0'],
            'referrer_second_reward_minor' => ['sometimes', 'integer', 'min:0'],
            'referee_first_discount_minor' => ['sometimes', 'integer', 'min:0'],
            'referee_second_discount_minor' => ['sometimes', 'integer', 'min:0'],
            'minimum_order_subtotal_minor' => ['sometimes', 'integer', 'min:0'],
            'first_order_deadline_days' => ['sometimes', 'integer', 'min:1', 'max:3650'],
            'second_order_deadline_days' => ['sometimes', 'integer', 'min:1', 'max:3650'],
            'reward_expiration_days' => ['sometimes', 'integer', 'min:1', 'max:3650'],
            'maximum_successful_referrals_per_user' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'manual_code_entry_enabled' => ['sometimes', 'boolean'],
            'customer_heading' => ['sometimes', 'nullable', 'string', 'max:160'],
            'referrer_benefit_title' => ['sometimes', 'nullable', 'string', 'max:160'],
            'referrer_benefit_copy' => ['sometimes', 'nullable', 'string'],
            'referee_benefit_title' => ['sometimes', 'nullable', 'string', 'max:160'],
            'referee_benefit_copy' => ['sometimes', 'nullable', 'string'],
            'invite_page_heading' => ['sometimes', 'nullable', 'string', 'max:160'],
            'invite_page_copy' => ['sometimes', 'nullable', 'string'],
            'share_message' => ['sometimes', 'nullable', 'string'],
            'terms_content' => ['sometimes', 'nullable', 'string'],
            'starts_at' => ['sometimes', 'nullable', 'date'],
            'ends_at' => ['sometimes', 'nullable', 'date', 'after:starts_at'],
        ]);
        $before = $program->toArray();
        $program->fill($values + ['updated_by' => $request->user()->id])->save();
        $this->audit($request, 'referral.settings.updated', $program, $before);

        return response()->json(['program' => $program->fresh()]);
    }

    private function payload(Referral $referral): array
    {
        return [
            'id' => $referral->uuid, 'status' => $referral->status, 'review_status' => $referral->review_status,
            'registered_at' => $referral->registered_at?->toIso8601String(), 'first_qualified_at' => $referral->first_qualified_at?->toIso8601String(),
            'second_qualified_at' => $referral->second_qualified_at?->toIso8601String(), 'disqualification_reason' => $referral->disqualification_reason,
            'code' => $referral->code?->code,
            'referrer' => ['id' => $referral->referrer?->uuid, 'name' => $referral->referrer?->name, 'email' => $referral->referrer?->email],
            'referred' => ['id' => $referral->referred?->uuid, 'name' => $referral->referred?->name, 'email' => $referral->referred?->email],
            'first_order_id' => $referral->firstQualifyingOrder?->uuid, 'second_order_id' => $referral->secondQualifyingOrder?->uuid,
            'program' => $referral->program?->only(['uuid', 'name', 'currency_code']),
            'rewards' => $referral->rewards->map(fn (ReferralReward $reward) => ['id' => $reward->uuid, 'milestone' => $reward->milestone, 'amount_minor' => $reward->amount_minor, 'status' => $reward->status, 'coupon_code' => $reward->promotion?->code, 'expires_at' => $reward->expires_at?->toIso8601String()])->values(),
        ];
    }

    private function findReferral(string $referral): Referral
    {
        return Referral::query()->where('uuid', $referral)->firstOrFail();
    }

    private function audit(Request $request, string $action, $subject, ?array $before): void
    {
        AdminAuditLog::query()->create(['admin_user_id' => $request->user()->id, 'action' => $action, 'subject_type' => $subject::class,
            'subject_id' => $subject->id, 'before_payload' => $before, 'after_payload' => $subject->fresh()->toArray(),
            'ip_address' => $request->ip(), 'user_agent' => substr((string) $request->userAgent(), 0, 1000)]);
    }
}
