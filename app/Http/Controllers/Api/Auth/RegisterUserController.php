<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterUserRequest;
use App\Http\Resources\Auth\AuthenticatedUserResource;
use App\Http\Resources\Auth\RegisteredUserResource;
use App\Services\Auth\RegisterUserService;
use App\Services\Auth\UserAuthTokenService;
use Illuminate\Http\JsonResponse;

class RegisterUserController extends Controller
{
    public function __invoke(
        RegisterUserRequest $request,
        RegisterUserService $registerUserService,
        UserAuthTokenService $tokenService,
    ): JsonResponse {
        $user = $registerUserService->handle($request->validated());
        $plainToken = $tokenService->createToken($user);

        return response()->json([
            'message' => 'Registration completed successfully.',
            'token_type' => 'Bearer',
            'token' => $plainToken,
            'user' => new AuthenticatedUserResource($user),
            'data' => [
                'user' => new RegisteredUserResource($user),
                'token_type' => 'Bearer',
                'token' => $plainToken,
                'next_url' => config('foodonlines.frontend_url', env('FRONTEND_URL')),
            ],
        ], 201);
    }
}
