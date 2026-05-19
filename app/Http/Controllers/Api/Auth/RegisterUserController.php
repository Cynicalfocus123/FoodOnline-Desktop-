<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterUserRequest;
use App\Http\Resources\Auth\RegisteredUserResource;
use App\Services\Auth\RegisterUserService;
use Illuminate\Http\JsonResponse;

class RegisterUserController extends Controller
{
    public function __invoke(
        RegisterUserRequest $request,
        RegisterUserService $registerUserService,
    ): JsonResponse {
        $user = $registerUserService->handle($request->validated());

        return response()->json([
            'message' => 'Registration completed successfully.',
            'data' => [
                'user' => new RegisteredUserResource($user),
                'next_url' => config('foodonlines.frontend_url', env('FRONTEND_URL')),
            ],
        ], 201);
    }
}
