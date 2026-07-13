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
        $supported = str_starts_with($lower, 'https://')
            || str_starts_with($lower, 'r2://')
            || preg_match('#^/?[a-z0-9][a-z0-9_./-]*$#i', $value) === 1;

        if ($unsafeScheme || $windowsPath || $traversal || $executable || ! $supported) {
            $fail("The {$attribute} must be a safe local path, HTTPS URL, or explicit R2 object key.");
        }
    }
}
