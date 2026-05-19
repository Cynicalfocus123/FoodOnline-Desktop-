<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginUserRequest;
use App\Http\Resources\Auth\AuthenticatedUserResource;
use App\Models\User;
use App\Models\UserApiToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class LoginUserController extends Controller
{
    public function __invoke(LoginUserRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $accountTypeColumn = Schema::hasColumn('users', 'account_type') ? 'account_type' : 'role';
        $supportedAccountTypes = config('foodonlines.supported_account_types', ['customer', 'supplier', 'partner']);

        $user = User::query()
            ->where('email', strtolower((string) $validated['email']))
            ->whereIn($accountTypeColumn, $supportedAccountTypes)
            ->where('status', 'active')
            ->first();

        if (! $user || ! is_string($user->password) || ! Hash::check((string) $validated['password'], $user->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        $plainToken = Str::random(80);

        UserApiToken::query()->create([
            'user_id' => $user->id,
            'name' => 'public-frontend',
            'token_hash' => hash('sha256', $plainToken),
            'last_used_at' => now(),
        ]);

        return response()->json([
            'message' => 'Login successful.',
            'token_type' => 'Bearer',
            'token' => $plainToken,
            'user' => new AuthenticatedUserResource($user),
        ]);
    }
}
