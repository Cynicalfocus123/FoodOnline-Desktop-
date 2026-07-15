<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Notifications\SecurityLinkNotification;

class PasswordRecoveryController extends Controller
{
    public function request(Request $request): JsonResponse { $data = $request->validate(['email' => ['required', 'email:rfc', 'max:254']]); $email = strtolower($data['email']); $user = User::query()->where('email', $email)->first(); if ($user) { $token = Str::random(80); $expires = now()->addHours(2); DB::table('password_reset_tokens')->updateOrInsert(['email' => $email], ['token_hash' => hash('sha256', $token), 'created_at' => now()]); $user->notify(new SecurityLinkNotification('password_recovery', $token, $expires->toIso8601String())); } return response()->json(['message' => 'If an account exists, recovery instructions will be sent.']); }
    public function reset(Request $request): JsonResponse { $data = $request->validate(['email' => ['required', 'email:rfc'], 'token' => ['required', 'string'], 'password' => ['required', 'string', 'min:10', 'max:72']]); $record = DB::table('password_reset_tokens')->where('email', strtolower($data['email']))->first(); abort_unless($record && hash_equals($record->token_hash, hash('sha256', $data['token'])) && now()->diffInHours($record->created_at) < 2, 422, 'This recovery token is invalid or expired.'); $user = User::query()->where('email', strtolower($data['email']))->firstOrFail(); $user->forceFill(['password' => Hash::make($data['password'])])->save(); DB::table('password_reset_tokens')->where('email', $user->email)->delete(); $user->userApiTokens()->whereNull('revoked_at')->update(['revoked_at' => now()]); return response()->json(['message' => 'Password reset.']); }
}
