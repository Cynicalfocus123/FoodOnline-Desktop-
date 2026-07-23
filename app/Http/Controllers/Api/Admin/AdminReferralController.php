<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Referral;
use App\Models\ReferralProgram;
use App\Models\ReferralReward;
use App\Models\User;
use App\Services\Referral\ReferralCodeService;
use App\Services\Referral\ReferralRewardService;
use App\Services\Referral\ReferralSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class AdminReferralController extends Controller
{
    private const ACCOUNT_TYPES = ['customer', 'supplier', 'partner'];

    public function index(Request $request, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) return $schema->unavailableResponse($request);
        $filters = $request->validate([
            'status' => ['nullable', 'string', Rule::in(['registered', 'active', 'completed', 'under_review', 'disqualified'])],
            'review_status' => ['nullable', 'string', Rule::in(['clear', 'under_review', 'disqualified'])],
            'referrer_account_type' => ['nullable', 'string', Rule::in(self::ACCOUNT_TYPES)],
            'referred_account_type' => ['nullable', 'string', Rule::in(self::ACCOUNT_TYPES)],
            'code' => ['nullable', 'string', 'max:32'],
            'search' => ['nullable', 'string', 'max:120'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $query = Referral::query()->with([
            'code:id,user_id,code,status',
            'referrer',
            'referred',
            'rewards:id,uuid,referral_id,status,issued_at,revoked_at',
        ]);
        if (! empty($filters['status'])) $query->where('status', $filters['status']);
        if (! empty($filters['review_status'])) $query->where('review_status', $filters['review_status']);
        if (! empty($filters['code'])) $query->whereHas('code', fn ($codes) => $codes->where('code', 'like', '%'.$filters['code'].'%'));
        if (! empty($filters['referrer_account_type'])) $query->whereHas('referrer', fn ($users) => $this->accountTypeQuery($users, $filters['referrer_account_type']));
        if (! empty($filters['referred_account_type'])) $query->whereHas('referred', fn ($users) => $this->accountTypeQuery($users, $filters['referred_account_type']));
        if (! empty($filters['search'])) {
            $search = '%'.$filters['search'].'%';
            $query->where(fn ($records) => $records
                ->whereHas('referrer', fn ($users) => $users->where('email', 'like', $search)->orWhere('name', 'like', $search))
                ->orWhereHas('referred', fn ($users) => $users->where('email', 'like', $search)->orWhere('name', 'like', $search)));
        }
        $page = $query->latest('registered_at')->paginate((int) ($filters['per_page'] ?? 25));

        return response()->json([
            'data' => $page->getCollection()->map(fn (Referral $referral) => $this->listPayload($referral))->values(),
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

        return response()->json(['referral' => $this->corePayload($this->findReferral($referral)->load($this->coreRelations()))]);
    }

    public function qualification(Request $request, string $referral, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) return $schema->unavailableResponse($request);
        $referral = $this->findReferral($referral)->load(['program', 'firstQualifyingOrder', 'secondQualifyingOrder']);

        return response()->json(['qualification' => [
            'status' => $this->qualificationStatus($referral),
            'rule' => $referral->program ? 'Delivered order with collected payment meeting the configured subtotal and deadline.' : null,
            'minimum_order_subtotal_minor' => $referral->program?->minimum_order_subtotal_minor,
            'currency_code' => $referral->program?->currency_code,
            'first' => $this->orderPayload($referral->firstQualifyingOrder, $referral->first_qualified_at),
            'second' => $this->orderPayload($referral->secondQualifyingOrder, $referral->second_qualified_at),
            'reason' => $this->qualificationReason($referral),
        ]]);
    }

    public function rewards(Request $request, string $referral, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) return $schema->unavailableResponse($request);
        $referral = $this->findReferral($referral)->load(['rewards.beneficiary', 'rewards.promotion', 'rewards.qualifyingOrder']);

        return response()->json(['rewards' => $referral->rewards->map(fn (ReferralReward $reward) => $this->rewardPayload($reward))->values()]);
    }

    public function auditHistory(Request $request, string $referral, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) return $schema->unavailableResponse($request);
        $referral = $this->findReferral($referral);
        $events = collect([[
            'id' => 'referral-created-'.$referral->uuid,
            'action' => 'Referral created',
            'timestamp' => $referral->registered_at?->toIso8601String(),
            'actor_type' => 'system',
            'admin_actor' => null,
            'previous_status' => null,
            'new_status' => 'registered',
            'summary' => 'Referral attribution was recorded during registration.',
        ]]);
        $audits = AdminAuditLog::query()->where('subject_type', Referral::class)->where('subject_id', $referral->id)->orderBy('created_at')->get();
        $adminNames = User::query()->whereIn('id', $audits->pluck('admin_user_id')->filter()->all())->pluck('name', 'id');
        $events = $events->merge($audits->map(fn (AdminAuditLog $audit) => [
            'id' => $audit->uuid,
            'action' => $this->auditLabel($audit->action),
            'timestamp' => $audit->created_at?->toIso8601String(),
            'actor_type' => $audit->admin_user_id ? 'administrator' : 'system',
            'admin_actor' => $audit->admin_user_id ? ($adminNames[$audit->admin_user_id] ?? 'Administrator') : null,
            'previous_status' => $audit->before_payload['status'] ?? null,
            'new_status' => $audit->after_payload['status'] ?? null,
            'summary' => $audit->metadata['reason'] ?? $this->auditSummary($audit->action),
        ]))->sortBy('timestamp')->values();

        return response()->json(['data' => $events]);
    }

    public function notifications(Request $request, string $referral, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) return $schema->unavailableResponse($request);
        $referral = $this->findReferral($referral);
        $notifications = DB::table('notifications')
            ->where('notifiable_type', User::class)
            ->whereIn('notifiable_id', [$referral->referrer_user_id, $referral->referred_user_id])
            ->orderBy('created_at')
            ->limit(200)
            ->get()
            ->map(function (object $notification) use ($referral): ?array {
                $data = json_decode((string) $notification->data, true);
                if (! is_array($data) || ($data['link']['referral_id'] ?? null) !== $referral->uuid) return null;

                return [
                    'id' => $notification->id,
                    'event' => $data['event'] ?? 'referral_update',
                    'title' => $data['title'] ?? 'Referral update',
                    'message' => $data['message'] ?? 'Referral status changed.',
                    'recipient' => (int) $notification->notifiable_id === $referral->referrer_user_id ? 'referrer' : 'referred account',
                    'created_at' => $notification->created_at,
                ];
            })->filter()->values();

        return response()->json(['data' => $notifications]);
    }

    public function action(Request $request, string $referral, ReferralCodeService $codes, ReferralRewardService $rewards, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) return $schema->unavailableResponse($request);
        $referral = $this->findReferral($referral);
        $values = $request->validate([
            'action' => ['required', Rule::in(['review', 'approve', 'disqualify', 'restore', 'revoke_reward', 'disable_code', 'add_note'])],
            'reason' => ['nullable', 'string', 'max:500'],
            'reward_id' => ['nullable', 'uuid'],
        ]);
        if (in_array($values['action'], ['review', 'disqualify', 'add_note'], true) && empty($values['reason'])) {
            return response()->json(['message' => 'Add a review note before continuing.', 'errors' => ['reason' => ['Add a review note before continuing.']]], 422);
        }
        $before = $referral->load(['code', 'rewards.promotion'])->toArray();

        DB::transaction(function () use ($values, $request, $referral, $codes, $rewards): void {
            $referral->refresh();
            $action = $values['action'];
            $reviewer = ['reviewed_by' => $request->user()->id, 'reviewed_at' => now()];
            if ($action === 'review') $referral->update([...$reviewer, 'status' => 'under_review', 'review_status' => 'under_review', 'review_note' => $values['reason']]);
            if ($action === 'approve') $referral->update([...$reviewer, 'status' => $referral->first_qualifying_order_id ? 'active' : 'registered', 'review_status' => 'clear']);
            if ($action === 'disqualify') $referral->update([...$reviewer, 'status' => 'disqualified', 'review_status' => 'disqualified', 'disqualified_at' => now(), 'disqualification_reason' => $values['reason'], 'review_note' => $values['reason']]);
            if ($action === 'restore') $referral->update([...$reviewer, 'status' => $referral->first_qualifying_order_id ? 'active' : 'registered', 'review_status' => 'clear', 'disqualified_at' => null, 'disqualification_reason' => null]);
            if ($action === 'add_note') $referral->update([...$reviewer, 'review_note' => $values['reason']]);
            if ($action === 'disable_code' && $referral->code) $codes->disable($referral->code);
            if ($action === 'revoke_reward') {
                $reward = $referral->rewards()->where('uuid', $values['reward_id'] ?? '')->with('promotion')->lockForUpdate()->firstOrFail();
                if ($reward->status === 'issued') {
                    $reward->update(['status' => 'revoked', 'revoked_at' => now(), 'revoked_by' => $request->user()->id, 'revocation_reason' => $values['reason'] ?? 'Revoked by administrator.']);
                    $reward->promotion?->update(['active' => false, 'archived_at' => now()]);
                }
            }
        }, 3);
        $this->audit($request, 'referral.'.$values['action'], $referral, $before, $values['reason'] ?? null);

        return response()->json(['referral' => $this->corePayload($referral->fresh()->load($this->coreRelations()))]);
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
            'status' => ['sometimes', Rule::in(['draft', 'active', 'paused', 'ended'])], 'currency_code' => ['sometimes', 'string', 'size:3'],
            'referrer_first_reward_minor' => ['sometimes', 'integer', 'min:0'], 'referrer_second_reward_minor' => ['sometimes', 'integer', 'min:0'],
            'referee_first_discount_minor' => ['sometimes', 'integer', 'min:0'], 'referee_second_discount_minor' => ['sometimes', 'integer', 'min:0'],
            'minimum_order_subtotal_minor' => ['sometimes', 'integer', 'min:0'], 'first_order_deadline_days' => ['sometimes', 'integer', 'min:1', 'max:3650'],
            'second_order_deadline_days' => ['sometimes', 'integer', 'min:1', 'max:3650'], 'reward_expiration_days' => ['sometimes', 'integer', 'min:1', 'max:3650'],
            'maximum_successful_referrals_per_user' => ['sometimes', 'nullable', 'integer', 'min:1'], 'manual_code_entry_enabled' => ['sometimes', 'boolean'],
            'customer_heading' => ['sometimes', 'nullable', 'string', 'max:160'], 'referrer_benefit_title' => ['sometimes', 'nullable', 'string', 'max:160'],
            'referrer_benefit_copy' => ['sometimes', 'nullable', 'string'], 'referee_benefit_title' => ['sometimes', 'nullable', 'string', 'max:160'],
            'referee_benefit_copy' => ['sometimes', 'nullable', 'string'], 'invite_page_heading' => ['sometimes', 'nullable', 'string', 'max:160'],
            'invite_page_copy' => ['sometimes', 'nullable', 'string'], 'share_message' => ['sometimes', 'nullable', 'string'], 'terms_content' => ['sometimes', 'nullable', 'string'],
            'starts_at' => ['sometimes', 'nullable', 'date'], 'ends_at' => ['sometimes', 'nullable', 'date', 'after:starts_at'],
        ]);
        $before = $program->toArray();
        $program->fill($values + ['updated_by' => $request->user()->id])->save();
        $this->audit($request, 'referral.settings.updated', $program, $before, null);

        return response()->json(['program' => $program->fresh()]);
    }

    /** @return array<int, string> */
    private function coreRelations(): array
    {
        return ['program', 'code', 'referrer', 'referred'];
    }

    private function listPayload(Referral $referral): array
    {
        return [
            ...$this->corePayload($referral),
            'qualification_state' => $this->qualificationStatus($referral),
            'reward_state' => $referral->rewards->pluck('status')->contains('revoked') ? 'revoked' : ($referral->rewards->pluck('status')->contains('issued') ? 'issued' : 'pending'),
        ];
    }

    private function corePayload(Referral $referral): array
    {
        return [
            'id' => $referral->uuid, 'status' => $referral->status, 'review_status' => $referral->review_status, 'review_note' => $referral->review_note,
            'registered_at' => $referral->registered_at?->toIso8601String(), 'updated_at' => $referral->updated_at?->toIso8601String(),
            'first_qualified_at' => $referral->first_qualified_at?->toIso8601String(), 'second_qualified_at' => $referral->second_qualified_at?->toIso8601String(),
            'disqualification_reason' => $referral->disqualification_reason, 'code' => $referral->code?->code,
            'attribution' => ['source' => 'registration', 'created_during_registration' => true, 'valid' => $referral->status !== 'disqualified', 'self_referral_protection' => 'enforced', 'duplicate_prevention' => 'one attribution per referred account'],
            'referrer' => $this->identityPayload($referral->referrer), 'referred' => $this->identityPayload($referral->referred),
            'program' => $referral->program ? ['id' => $referral->program->uuid, 'name' => $referral->program->name, 'currency_code' => $referral->program->currency_code] : null,
        ];
    }

    private function identityPayload(?User $user): ?array
    {
        if (! $user) return null;
        return ['id' => $user->uuid, 'name' => $user->name, 'email' => $user->email, 'account_type' => $this->accountType($user), 'status' => $user->status, 'registered_at' => $user->created_at?->toIso8601String()];
    }

    private function rewardPayload(ReferralReward $reward): array
    {
        return [
            'id' => $reward->uuid, 'milestone' => $reward->milestone, 'reward_type' => $reward->reward_type, 'amount_minor' => $reward->amount_minor,
            'currency_code' => $reward->currency_code, 'status' => $reward->status, 'issued_at' => $reward->issued_at?->toIso8601String(),
            'expires_at' => $reward->expires_at?->toIso8601String(), 'redeemed_at' => $reward->redeemed_at?->toIso8601String(),
            'revoked_at' => $reward->revoked_at?->toIso8601String(), 'revocation_reason' => $reward->revocation_reason,
            'beneficiary' => $this->identityPayload($reward->beneficiary),
            'coupon' => $reward->promotion ? ['id' => $reward->promotion->uuid, 'code' => $reward->promotion->code, 'status' => $reward->promotion->active ? 'active' : 'inactive', 'expires_at' => $reward->promotion->ends_at?->toIso8601String()] : null,
            'qualifying_order' => $this->orderPayload($reward->qualifyingOrder, null),
        ];
    }

    private function orderPayload($order, $qualifiedAt): ?array
    {
        if (! $order) return null;
        return ['id' => $order->uuid, 'reference' => $order->order_number, 'order_status' => $order->order_status, 'payment_status' => $order->payment_status,
            'fulfillment_status' => $order->fulfillment_status, 'subtotal_minor' => $order->subtotal_minor, 'currency_code' => $order->currency_code,
            'qualified_at' => $qualifiedAt?->toIso8601String()];
    }

    private function qualificationStatus(Referral $referral): string
    {
        if ($referral->status === 'disqualified') return 'cancelled';
        if ($referral->review_status === 'under_review' || $referral->status === 'under_review') return 'under review';
        if ($referral->second_qualified_at) return 'rewarded';
        if ($referral->first_qualified_at) return 'qualified';
        return 'waiting for qualifying order';
    }

    private function qualificationReason(Referral $referral): ?string
    {
        if ($referral->status === 'disqualified') return $referral->disqualification_reason ?: 'This referral was rejected during review.';
        if ($referral->review_status === 'under_review') return $referral->review_note ?: 'This referral requires administrator review.';
        if (! $referral->first_qualifying_order_id) return 'Waiting for the referred account’s qualifying order.';
        if (! $referral->second_qualifying_order_id) return 'Waiting for the referred account’s second qualifying order.';
        return null;
    }

    private function accountType(User $user): string
    {
        return strtolower((string) ($user->account_type ?: $user->role ?: 'account'));
    }

    private function accountTypeQuery($query, string $type): void
    {
        if (Schema::hasColumn('users', 'account_type')) {
            $query->whereRaw('COALESCE(account_type, role) = ?', [$type]);
            return;
        }

        $query->where('role', $type);
    }

    private function auditLabel(string $action): string
    {
        return match ($action) {
            'referral.review' => 'Referral moved to review', 'referral.approve' => 'Review approved', 'referral.disqualify' => 'Qualification rejected',
            'referral.restore' => 'Review resolved', 'referral.revoke_reward' => 'Reward revoked', 'referral.disable_code' => 'Referral code disabled',
            'referral.add_note' => 'Review note added', default => 'Referral updated',
        };
    }

    private function auditSummary(string $action): string
    {
        return match ($action) {
            'referral.review' => 'The referral was marked for review.', 'referral.approve' => 'The referral review was approved.',
            'referral.disqualify' => 'The referral was rejected.', 'referral.restore' => 'The referral was restored.',
            'referral.revoke_reward' => 'A referral reward was revoked.', 'referral.disable_code' => 'The invite code was disabled.',
            'referral.add_note' => 'An internal review note was recorded.', default => 'The referral record was updated.',
        };
    }

    private function findReferral(string $referral): Referral
    {
        return Referral::query()->where('uuid', $referral)->firstOrFail();
    }

    private function audit(Request $request, string $action, $subject, ?array $before, ?string $reason): void
    {
        AdminAuditLog::query()->create(['admin_user_id' => $request->user()->id, 'action' => $action, 'subject_type' => $subject::class,
            'subject_id' => $subject->id, 'before_payload' => $before, 'after_payload' => $subject->fresh()->toArray(),
            'metadata' => $reason ? ['reason' => $reason] : null, 'ip_address' => $request->ip(), 'user_agent' => substr((string) $request->userAgent(), 0, 1000)]);
    }
}
