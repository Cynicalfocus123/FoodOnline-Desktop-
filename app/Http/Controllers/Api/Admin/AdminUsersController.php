<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminManagedUserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminUsersController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'account_type' => ['nullable', 'string', Rule::in(['customer', 'supplier', 'partner'])],
            'role' => ['nullable', 'string', Rule::in(['customer', 'supplier', 'partner'])],
        ]);
        $accountType = $validated['account_type'] ?? $validated['role'] ?? null;
        $accountTypeColumn = Schema::hasColumn('users', 'account_type') ? 'account_type' : 'role';

        $users = User::query()
            ->whereIn($accountTypeColumn, ['customer', 'supplier', 'partner'])
            ->when($accountType, fn ($query, string $role) => $query->where($accountTypeColumn, $role))
            ->latest()
            ->get();

        return response()->json([
            'users' => AdminManagedUserResource::collection($users),
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $this->ensureManagedUser($user);

        return $this->detailResponse($user);
    }

    public function store(Request $request): JsonResponse
    {
        $values = $this->validatedValues($request, null);
        $user = DB::transaction(function () use ($values): User {
            $accountType = $values['account_type'];
            $attributes = $values;
            unset($attributes['account_type']);
            $attributes[Schema::hasColumn('users', 'account_type') ? 'account_type' : 'role'] = $accountType;

            return User::query()->create([
                ...$attributes,
                'name' => trim(($values['first_name'] ?? '').' '.($values['last_name'] ?? '')) ?: $values['email'],
                'phone' => $values['contact_number'] ?? null,
                'registered_from' => 'admin',
            ]);
        });

        return response()->json(['user' => new AdminManagedUserResource($user)], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $this->ensureManagedUser($user);
        $values = $this->validatedValues($request, $user);
        $accountType = $values['account_type'] ?? ($user->account_type ?: $user->role);
        $attributes = $values;
        unset($attributes['account_type']);
        $attributes[Schema::hasColumn('users', 'account_type') ? 'account_type' : 'role'] = $accountType;
        $user->fill([
            ...$attributes,
            'name' => trim(($values['first_name'] ?? $user->first_name ?? '').' '.($values['last_name'] ?? $user->last_name ?? '')) ?: ($values['email'] ?? $user->email),
            'phone' => $values['contact_number'] ?? $user->contact_number,
        ])->save();

        return $this->detailResponse($user->fresh());
    }

    public function destroy(User $user): JsonResponse
    {
        $this->ensureManagedUser($user);
        $user->forceFill(['status' => 'disabled'])->save();
        $user->userApiTokens()->delete();

        return $this->detailResponse($user->fresh());
    }

    /** @return array<string, mixed> */
    private function validatedValues(Request $request, ?User $user): array
    {
        foreach (['company_name', 'line_id'] as $field) {
            if ($request->exists($field)) {
                $value = trim((string) $request->input($field));
                $request->merge([$field => $value !== '' ? $value : null]);
            }
        }
        $presence = $user ? 'sometimes' : 'required';

        return $request->validate([
            'account_type' => [$presence, 'string', Rule::in(['customer', 'supplier', 'partner'])],
            'email' => [$presence, 'email', 'max:254', Rule::unique('users', 'email')->ignore($user?->id)],
            'first_name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'last_name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'contact_number' => ['sometimes', 'nullable', 'string', 'max:40'],
            'line_id' => ['sometimes', 'nullable', 'string', 'max:40', 'regex:/^[A-Za-z0-9][A-Za-z0-9._@-]{2,39}$/'],
            'company_name' => ['sometimes', 'nullable', 'string', 'max:120', 'regex:/^[\pL\pN][\pL\pN \'&.,()\/-]*$/u'],
            'business_type' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'string', Rule::in(['active', 'in_review', 'disabled'])],
            'password' => [$presence, 'nullable', 'string', 'min:8', 'max:128'],
        ]);
    }

    private function ensureManagedUser(User $user): void
    {
        abort_unless(in_array($user->account_type ?: $user->role, ['customer', 'supplier', 'partner'], true), 404);
    }

    private function detailResponse(User $user): JsonResponse
    {
        $relations = [];
        if ($this->referralSchemaIsReady()) {
            $relations = ['referralCode', 'referralReceived', 'referralsMade', 'referralRewards'];
        }
        if (($user->account_type ?: $user->role) === 'customer') {
            if (Schema::hasTable('user_addresses')) {
                $relations['addresses'] = fn ($query) => $query
                    ->orderByDesc('is_default')
                    ->orderByDesc('id');
            }
            if (Schema::hasTable('user_payment_methods')) {
                $relations['paymentMethods'] = fn ($query) => $query
                    ->where('status', 'active')
                    ->orderByDesc('is_default')
                    ->orderByDesc('id');
            }
        }

        return response()->json([
            'user' => new AdminManagedUserResource($user->load($relations)),
        ]);
    }

    private function referralSchemaIsReady(): bool
    {
        foreach (['referral_programs', 'referral_codes', 'referrals', 'referral_rewards'] as $table) {
            if (! Schema::hasTable($table)) {
                return false;
            }
        }

        return true;
    }
}
