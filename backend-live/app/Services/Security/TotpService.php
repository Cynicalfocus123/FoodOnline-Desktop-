<?php

namespace App\Services\Security;

use App\Models\AdminRecoveryCode;
use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class TotpService
{
    public function secret(): string { $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; $bits = 0; $value = 0; $output = ''; foreach (str_split(random_bytes(20)) as $byte) { $value = ($value << 8) | ord($byte); $bits += 8; while ($bits >= 5) { $bits -= 5; $output .= $alphabet[($value >> $bits) & 31]; } } if ($bits > 0) $output .= $alphabet[($value << (5 - $bits)) & 31]; return $output; }
    public function uri(string $secret, string $email): string { return 'otpauth://totp/FoodOnlines:'.rawurlencode($email).'?secret='.$secret.'&issuer=FoodOnlines&algorithm=SHA1&digits=6&period=30'; }
    public function verify(string $secret, string $code, ?int $window = 1): bool
    {
        $code = preg_replace('/\D/', '', $code) ?? ''; if (strlen($code) !== 6) return false;
        $decoded = $this->base32Decode($secret); $counter = (int) floor(time() / 30);
        for ($offset = -$window; $offset <= $window; $offset++) { $binary = pack('N*', 0).pack('N*', $counter + $offset); $hash = hash_hmac('sha1', $binary, $decoded, true); $index = ord($hash[19]) & 0xf; $number = ((ord($hash[$index]) & 0x7f) << 24) | ((ord($hash[$index + 1]) & 0xff) << 16) | ((ord($hash[$index + 2]) & 0xff) << 8) | (ord($hash[$index + 3]) & 0xff); if (hash_equals(str_pad((string) ($number % 1000000), 6, '0', STR_PAD_LEFT), $code)) return true; }
        return false;
    }
    public function setup(User $user): array
    {
        $secret = $this->secret(); $codes = collect(range(1, 10))->map(fn () => strtoupper(Str::random(4).'-'.Str::random(4)))->all();
        $user->forceFill(['mfa_secret' => Crypt::encryptString($secret)])->save();
        $user->adminRecoveryCodes()->delete(); foreach ($codes as $code) { $user->adminRecoveryCodes()->create(['code_hash' => hash('sha256', $code)]); }
        return ['secret' => $secret, 'otpauth_uri' => $this->uri($secret, $user->email), 'recovery_codes' => $codes];
    }
    public function secretFor(User $user): ?string { return $user->mfa_secret ? Crypt::decryptString($user->mfa_secret) : null; }
    public function verifyRecovery(User $user, string $code): bool { $item = $user->adminRecoveryCodes()->whereNull('used_at')->where('code_hash', hash('sha256', strtoupper(trim($code))))->first(); if (! $item) return false; $item->update(['used_at' => now()]); return true; }

    private function base32Decode(string $secret): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; $bits = 0; $value = 0; $output = '';
        foreach (str_split(strtoupper($secret)) as $character) { $index = strpos($alphabet, $character); if ($index === false) continue; $value = ($value << 5) | $index; $bits += 5; if ($bits >= 8) { $bits -= 8; $output .= chr(($value >> $bits) & 255); } }
        return $output;
    }
}
