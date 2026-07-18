<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class SafeMediaPath implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || $value === '') {
            return;
        }

        $lower = strtolower($value);
        $unsafeScheme = preg_match('/^(?:file|javascript|data|vbscript):/i', $value) === 1;
        $windowsPath = preg_match('/^[a-z]:[\\\\\/]/i', $value) === 1 || str_contains($value, '\\');
        $traversal = preg_match('#(^|/)\.\.(/|$)#', $value) === 1;
        $executable = preg_match('/\.(?:php\d*|phtml|phar|cgi|pl|py|sh|exe|bat|cmd|js|html?)(?:\?|#|$)/i', $lower) === 1;
        $developmentPath = preg_match('#^/?(?:src|dist|frontend-upload|node_modules|temp|tmp)(?:/|$)#i', $value) === 1;
        $https = filter_var($value, FILTER_VALIDATE_URL) !== false
            && strtolower((string) parse_url($value, PHP_URL_SCHEME)) === 'https'
            && is_string(parse_url($value, PHP_URL_HOST));
        $r2 = preg_match('#^r2://[a-z0-9][a-z0-9_./-]*$#i', $value) === 1;
        $managedLocal = preg_match('#^local://media/(?:products|brands|categories|reviews|returns|support)/[a-z0-9][a-z0-9_./-]*$#i', $value) === 1;
        $local = preg_match('#^/?[a-z0-9][a-z0-9_./-]*$#i', $value) === 1;
        $supported = $https || $r2 || $managedLocal || $local;

        if ($unsafeScheme || $windowsPath || $traversal || $executable || $developmentPath || ! $supported) {
            $fail("The {$attribute} must be a safe managed-media reference, local path, or HTTPS URL.");
        }
    }
}
