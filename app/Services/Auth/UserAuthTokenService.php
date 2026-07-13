<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\UserApiToken;
use Illuminate\Support\Str;

class UserAuthTokenService
{
    public function createToken(User $user, string $name = 'public-frontend'): string
    {
        $plainToken = Str::random(80);

        UserApiToken::query()->create([
            'user_id' => $user->id,
            'name' => $name,
            'token_hash' => hash('sha256', $plainToken),
            'last_used_at' => now(),
            'expires_at' => now()->addMinutes(max(1, (int) config('foodonlines.tokens.user_ttl_minutes', 43200))),
        ]);

        return $plainToken;
    }
}
