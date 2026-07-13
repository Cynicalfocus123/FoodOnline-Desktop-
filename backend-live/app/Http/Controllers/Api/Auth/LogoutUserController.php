<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\UserApiToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogoutUserController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $token = $request->attributes->get('user_api_token');

        if ($token instanceof UserApiToken) {
            $token->forceFill(['revoked_at' => now()])->save();
        }

        return response()->json(['message' => 'Logged out.']);
    }
}
