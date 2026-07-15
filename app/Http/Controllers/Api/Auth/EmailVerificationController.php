<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\EmailVerificationToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Notifications\SecurityLinkNotification;

class EmailVerificationController extends Controller
{
    public function request(Request $request): JsonResponse { $token = Str::random(80); $expires = now()->addHours(24); EmailVerificationToken::query()->where('user_id', $request->user()->id)->whereNull('used_at')->delete(); EmailVerificationToken::query()->create(['user_id' => $request->user()->id, 'token_hash' => hash('sha256', $token), 'expires_at' => $expires]); $request->user()->notify(new SecurityLinkNotification('email_verification', $token, $expires->toIso8601String())); return response()->json(['message' => 'Verification instructions will be sent.']); }
    public function verify(Request $request): JsonResponse { $data = $request->validate(['token' => ['required', 'string']]); $verification = EmailVerificationToken::query()->where('token_hash', hash('sha256', $data['token']))->whereNull('used_at')->where('expires_at', '>', now())->firstOrFail(); $verification->user->forceFill(['email_verified_at' => now()])->save(); $verification->update(['used_at' => now()]); return response()->json(['message' => 'Email verified.']); }
}
