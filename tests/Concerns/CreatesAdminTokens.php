<?php

namespace Tests\Concerns;

use App\Models\AdminApiToken;
use App\Models\User;

trait CreatesAdminTokens
{
    /** @return array{0: User, 1: string} */
    protected function adminToken(): array
    {
        $admin = User::factory()->admin()->create();
        $plain = 'category-admin-token-'.bin2hex(random_bytes(12));
        AdminApiToken::query()->create([
            'user_id' => $admin->id,
            'name' => 'category-tests',
            'token_hash' => hash('sha256', $plain),
            'expires_at' => now()->addHour(),
        ]);

        return [$admin, $plain];
    }
}
