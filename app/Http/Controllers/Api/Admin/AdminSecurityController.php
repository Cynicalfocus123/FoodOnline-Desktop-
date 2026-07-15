<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminApiToken;
use App\Models\User;
use App\Services\Security\TotpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminSecurityController extends Controller
{
    public function staff(Request $request): JsonResponse { return response()->json(['data' => User::query()->where('role', 'admin')->orderBy('name')->get()->map(fn ($user) => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'role' => $user->staff_role ?? 'super_admin', 'status' => $user->status, 'mfa_enabled' => (bool) $user->mfa_enabled_at, 'last_login_at' => $user->last_login_at?->toIso8601String(), 'created_at' => $user->created_at?->toIso8601String()])]); }
    public function updateStaff(Request $request, User $user): JsonResponse
    {
        abort_unless($user->role === 'admin', 404); $data = $request->validate(['staff_role' => ['required', Rule::in(['super_admin', 'order_manager', 'inventory_manager', 'catalog_manager', 'customer_support', 'marketing_manager', 'read_only'])], 'status' => ['nullable', Rule::in(['active', 'disabled'])], 'staff_permissions' => ['nullable', 'array']]);
        if ($user->id === $request->user()->id && ($data['staff_role'] !== 'super_admin' || ($data['status'] ?? 'active') !== 'active')) abort(422, 'You cannot remove your own final access.');
        $isSuper = $user->staff_role === null || $user->staff_role === 'super_admin';
        if ($isSuper && $data['staff_role'] !== 'super_admin' && User::query()->where('role', 'admin')->where('status', 'active')->where(function ($q): void { $q->whereNull('staff_role')->orWhere('staff_role', 'super_admin'); })->where('id', '!=', $user->id)->doesntExist()) abort(422, 'At least one active super administrator must remain.');
        $user->forceFill(['staff_role' => $data['staff_role'], 'staff_permissions' => $data['staff_permissions'] ?? $user->staff_permissions, 'status' => $data['status'] ?? $user->status])->save(); return response()->json(['staff' => $user->fresh()]);
    }
    public function sessions(Request $request): JsonResponse { return response()->json(['data' => AdminApiToken::query()->where('user_id', $request->user()->id)->whereNull('revoked_at')->latest()->get(['id', 'name', 'ip_address', 'user_agent', 'last_used_at', 'expires_at', 'created_at'])]); }
    public function revokeSession(Request $request, AdminApiToken $token): JsonResponse { abort_unless($token->user_id === $request->user()->id, 404); $token->update(['revoked_at' => now()]); return response()->json(['message' => 'Session revoked.']); }
    public function mfaSetup(Request $request, TotpService $totp): JsonResponse { return response()->json($totp->setup($request->user())); }
    public function mfaEnable(Request $request, TotpService $totp): JsonResponse { $data = $request->validate(['code' => ['required', 'string', 'size:6']]); $secret = $totp->secretFor($request->user()); abort_unless($secret && $totp->verify($secret, $data['code']), 422, 'Invalid MFA code.'); $request->user()->forceFill(['mfa_enabled_at' => now()])->save(); return response()->json(['message' => 'MFA enabled.']); }
    public function mfaDisable(Request $request, TotpService $totp): JsonResponse { $data = $request->validate(['code' => ['required', 'string', 'max:32']]); $user = $request->user(); $valid = ($totp->secretFor($user) && $totp->verify((string) $totp->secretFor($user), $data['code'])) || $totp->verifyRecovery($user, $data['code']); abort_unless($valid, 422, 'Invalid MFA code.'); $user->forceFill(['mfa_secret' => null, 'mfa_enabled_at' => null])->save(); return response()->json(['message' => 'MFA disabled.']); }
}
