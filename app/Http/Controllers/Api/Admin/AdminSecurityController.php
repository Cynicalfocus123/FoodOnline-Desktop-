<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateStaffAdminRequest;
use App\Http\Requests\Admin\ResetStaffPasswordRequest;
use App\Http\Requests\Admin\UpdateStaffAdminRequest;
use App\Models\AdminApiToken;
use App\Models\AdminAuditLog;
use App\Models\User;
use App\Services\Security\AdminPermissionCatalog;
use App\Services\Security\TotpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AdminSecurityController extends Controller
{
    public function staff(Request $request): JsonResponse
    {
        $this->assertSuperAdmin($request);
        $admins = User::query()->where('role', 'admin')->orderBy('name')->get();

        return response()->json(['data' => $admins->map(fn (User $user): array => $this->staffPayload($user))->values()]);
    }

    public function storeStaff(CreateStaffAdminRequest $request): JsonResponse
    {
        $this->assertSuperAdmin($request);
        $data = $request->validated();
        $role = (string) $data['staff_role'];

        $admin = DB::transaction(function () use ($data, $role, $request): User {
            [$firstName, $lastName] = $this->splitName((string) $data['name']);
            $admin = User::query()->create([
                'name' => $data['name'],
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => strtolower((string) $data['email']),
                'password' => Hash::make((string) $data['password']),
                'role' => 'admin',
                'staff_role' => $role,
                'staff_permissions' => $role === AdminPermissionCatalog::SUPER_ADMIN
                    ? null
                    : (array_key_exists('staff_permissions', $data) ? array_values(array_unique($data['staff_permissions'])) : null),
                'status' => $data['status'],
                'registered_from' => 'admin_staff_management',
            ]);
            $this->audit($request, 'staff.created', $admin, null, $this->auditPayload($admin));
            return $admin;
        });

        return response()->json([
            'message' => 'Administrator created.',
            'staff' => $this->staffPayload($admin->fresh()),
        ], Response::HTTP_CREATED);
    }

    public function updateStaff(UpdateStaffAdminRequest $request, User $user): JsonResponse
    {
        $this->assertSuperAdmin($request);
        abort_unless($user->role === 'admin', Response::HTTP_NOT_FOUND);
        $data = $request->validated();
        $before = $this->auditPayload($user);
        $role = (string) ($data['staff_role'] ?? ($user->staff_role ?? AdminPermissionCatalog::SUPER_ADMIN));
        $status = (string) ($data['status'] ?? $user->status);

        if ($user->id === $request->user()->id && ($role !== AdminPermissionCatalog::SUPER_ADMIN || $status !== 'active')) {
            abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'You cannot remove your own final administrator access.');
        }
        $this->ensureActiveSuperAdminRemains($user, $role, $status);

        $updates = [];
        foreach (['name', 'email', 'status'] as $field) {
            if (array_key_exists($field, $data)) $updates[$field] = $data[$field];
        }
        if (array_key_exists('name', $updates)) {
            [$updates['first_name'], $updates['last_name']] = $this->splitName((string) $updates['name']);
        }
        if (array_key_exists('email', $updates)) $updates['email'] = strtolower((string) $updates['email']);
        $updates['staff_role'] = $role;
        $updates['staff_permissions'] = $role === AdminPermissionCatalog::SUPER_ADMIN
            ? null
            : (array_key_exists('staff_permissions', $data)
                ? array_values(array_unique($data['staff_permissions']))
                : ($role !== ($user->staff_role ?? AdminPermissionCatalog::SUPER_ADMIN) ? null : $user->staff_permissions));

        DB::transaction(function () use ($request, $user, $updates, $before, $status, $role): void {
            $user->forceFill($updates)->save();
            if ($status === 'disabled') {
                AdminApiToken::query()->where('user_id', $user->id)->whereNull('revoked_at')->update(['revoked_at' => now()]);
            }
            $action = $status !== ($before['status'] ?? $status)
                ? 'staff.status_changed'
                : ($role !== ($before['staff_role'] ?? $role) ? 'staff.role_permissions_updated' : 'staff.updated');
            $this->audit($request, $action, $user, $before, $this->auditPayload($user->fresh()));
        });

        return response()->json(['message' => 'Administrator updated.', 'staff' => $this->staffPayload($user->fresh())]);
    }

    public function resetStaffPassword(ResetStaffPasswordRequest $request, User $user): JsonResponse
    {
        $this->assertSuperAdmin($request);
        abort_unless($user->role === 'admin', Response::HTTP_NOT_FOUND);
        $before = $this->auditPayload($user);
        $validated = $request->validated();

        DB::transaction(function () use ($request, $user, $validated, $before): void {
            $user->forceFill(['password' => Hash::make((string) $validated['password'])])->save();
            AdminApiToken::query()->where('user_id', $user->id)->whereNull('revoked_at')->update(['revoked_at' => now()]);
            $this->audit($request, 'staff.password_reset', $user, $before, $this->auditPayload($user->fresh()));
        });

        return response()->json(['message' => 'Administrator password reset.']);
    }

    public function sessions(Request $request): JsonResponse
    {
        $this->assertSuperAdmin($request);
        $sessions = AdminApiToken::query()
            ->with('user:id,name,email')
            ->whereNull('revoked_at')
            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->latest()->get()
            ->map(fn (AdminApiToken $token): array => [
                'id' => $token->id,
                'admin_id' => $token->user_id,
                'admin_name' => $token->user?->name,
                'admin_email' => $token->user?->email,
                'last_used_at' => $token->last_used_at?->toIso8601String(),
                'expires_at' => $token->expires_at?->toIso8601String(),
                'created_at' => $token->created_at?->toIso8601String(),
            ]);

        return response()->json(['data' => $sessions->values()]);
    }

    public function revokeSession(Request $request, AdminApiToken $token): JsonResponse
    {
        $this->assertSuperAdmin($request);
        $token->update(['revoked_at' => now()]);
        $admin = User::query()->find($token->user_id);
        if ($admin) $this->audit($request, 'staff.session_revoked', $admin, null, ['token_id' => $token->id]);

        return response()->json(['message' => 'Administrator session revoked.']);
    }

    public function mfaSetup(Request $request, TotpService $totp): JsonResponse
    {
        return response()->json($totp->setup($request->user()));
    }

    public function mfaEnable(Request $request, TotpService $totp): JsonResponse
    {
        $data = $request->validate(['code' => ['required', 'string', 'size:6']]);
        $secret = $totp->secretFor($request->user());
        abort_unless($secret && $totp->verify($secret, $data['code']), Response::HTTP_UNPROCESSABLE_ENTITY, 'Invalid MFA code.');
        $request->user()->forceFill(['mfa_enabled_at' => now()])->save();
        return response()->json(['message' => 'MFA enabled.']);
    }

    public function mfaDisable(Request $request, TotpService $totp): JsonResponse
    {
        $data = $request->validate(['code' => ['required', 'string', 'max:32']]);
        $user = $request->user();
        $secret = $totp->secretFor($user);
        $valid = ($secret && $totp->verify($secret, $data['code'])) || $totp->verifyRecovery($user, $data['code']);
        abort_unless($valid, Response::HTTP_UNPROCESSABLE_ENTITY, 'Invalid MFA code.');
        $user->forceFill(['mfa_secret' => null, 'mfa_enabled_at' => null])->save();
        return response()->json(['message' => 'MFA disabled.']);
    }

    private function assertSuperAdmin(Request $request): void
    {
        abort_unless(AdminPermissionCatalog::isSuperAdmin($request->user()), Response::HTTP_FORBIDDEN, 'Only a Super Admin can manage administrator security.');
    }

    private function ensureActiveSuperAdminRemains(User $target, string $role, string $status): void
    {
        if (! AdminPermissionCatalog::isSuperAdmin($target) || ($role === AdminPermissionCatalog::SUPER_ADMIN && $status === 'active')) return;
        $hasAnother = User::query()->where('role', 'admin')->where('status', 'active')->whereKeyNot($target->id)
            ->where(fn ($query) => $query->whereNull('staff_role')->orWhere('staff_role', AdminPermissionCatalog::SUPER_ADMIN))->exists();
        abort_unless($hasAnother, Response::HTTP_UNPROCESSABLE_ENTITY, 'At least one active Super Admin must remain.');
    }

    /** @return array<string, mixed> */
    private function staffPayload(User $user): array
    {
        $permissions = AdminPermissionCatalog::effectivePermissions($user);
        return [
            'id' => $user->id, 'name' => $user->name, 'email' => $user->email,
            'staff_role' => $user->staff_role ?? AdminPermissionCatalog::SUPER_ADMIN,
            'permissions' => $permissions, 'permission_count' => count($permissions),
            'status' => $user->status, 'mfa_enabled' => (bool) $user->mfa_enabled_at,
            'last_login_at' => $user->last_login_at?->toIso8601String(),
            'created_at' => $user->created_at?->toIso8601String(),
        ];
    }

    /** @return array<string, mixed> */
    private function auditPayload(User $user): array
    {
        return [
            'id' => $user->id, 'name' => $user->name, 'email' => $user->email,
            'staff_role' => $user->staff_role ?? AdminPermissionCatalog::SUPER_ADMIN,
            'permissions' => AdminPermissionCatalog::effectivePermissions($user), 'status' => $user->status,
        ];
    }

    private function audit(Request $request, string $action, User $subject, ?array $before, array $after): void
    {
        AdminAuditLog::query()->create([
            'admin_user_id' => $request->user()->id, 'action' => $action,
            'subject_type' => User::class, 'subject_id' => $subject->id,
            'before_payload' => $before, 'after_payload' => $after,
            'ip_address' => $request->ip(), 'user_agent' => substr((string) $request->userAgent(), 0, 1000),
        ]);
    }

    /** @return array{0: string, 1: string} */
    private function splitName(string $name): array
    {
        $parts = preg_split('/\s+/', trim($name)) ?: [];
        return [$parts[0] ?? 'Administrator', count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : ''];
    }
}
