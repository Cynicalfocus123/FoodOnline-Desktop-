<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Models\UserApiToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    public function index(Request $request): JsonResponse { return response()->json(['data' => $request->user()->userApiTokens()->whereNull('revoked_at')->latest()->get(['id', 'name', 'last_used_at', 'expires_at', 'created_at'])]); }
    public function destroy(Request $request, UserApiToken $token): JsonResponse { abort_unless($token->user_id === $request->user()->id, 404); $token->update(['revoked_at' => now()]); return response()->json(['message' => 'Session revoked.']); }
}
