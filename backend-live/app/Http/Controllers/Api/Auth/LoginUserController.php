<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginUserRequest;
use App\Http\Resources\Auth\AuthenticatedUserResource;
use App\Models\User;
use App\Services\Auth\UserAuthTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class LoginUserController extends Controller
{
    public function __invoke(LoginUserRequest $request, UserAuthTokenService $tokenService): JsonResponse
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

        $plainToken = $tokenService->createToken($user);

        return response()->json([
            'message' => 'Login successful.',
            'token_type' => 'Bearer',
            'token' => $plainToken,
            'user' => new AuthenticatedUserResource($user),
        ]);
    }
}
