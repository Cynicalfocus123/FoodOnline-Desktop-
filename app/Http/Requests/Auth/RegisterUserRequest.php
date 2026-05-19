<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'role' => $this->sanitizeSimpleValue('role') ?: $this->sanitizeSimpleValue('account_type'),
            'company_name' => $this->sanitizeTextValue('company_name'),
            'contact_number' => $this->sanitizeContactNumber(),
            'email' => $this->sanitizeEmail(),
            'first_name' => $this->sanitizeTextValue('first_name'),
            'last_name' => $this->sanitizeTextValue('last_name'),
            'line_id' => $this->sanitizeLineId(),
            'password' => $this->sanitizePassword(),
            'registered_from' => $this->sanitizeSimpleValue('registered_from') ?: 'website',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'role' => [
                'required',
                'string',
                Rule::in(config('foodonlines.supported_account_types', ['customer', 'supplier', 'partner'])),
            ],
            'company_name' => [
                'required',
                'string',
                'max:120',
                'regex:/^[\pL\pN][\pL\pN \'&.,()\/-]*$/u',
            ],
            'contact_number' => [
                'required',
                'string',
                'max:20',
                'regex:/^\+?[0-9()\- ]+$/',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $digits = preg_replace('/\D+/', '', (string) $value) ?? '';
                    $digitCount = strlen($digits);

                    if ($digitCount < 7 || $digitCount > 15) {
                        $fail('Enter a valid contact number with 7 to 15 digits.');
                    }
                },
            ],
            'email' => [
                'required',
                'string',
                'email:rfc',
                'max:254',
                'unique:users,email',
            ],
            'first_name' => [
                'required',
                'string',
                'max:60',
                'regex:/^[\pL\pN][\pL\pN \'.-]*$/u',
            ],
            'last_name' => [
                'required',
                'string',
                'max:60',
                'regex:/^[\pL\pN][\pL\pN \'.-]*$/u',
            ],
            'line_id' => [
                'nullable',
                'string',
                'max:40',
                'regex:/^[A-Za-z0-9][A-Za-z0-9._@-]{2,39}$/',
            ],
            'password' => [
                'nullable',
                'string',
                'min:10',
                'max:72',
                'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/',
            ],
            'registered_from' => [
                'nullable',
                'string',
                'max:50',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'role.in' => 'Select Customer, Supplier, or Partner.',
            'company_name.regex' => 'Use letters, numbers, spaces, and basic business punctuation only.',
            'contact_number.regex' => 'Enter a valid contact number with 7 to 15 digits.',
            'email.email' => 'Enter a valid email address.',
            'first_name.regex' => 'Use letters, numbers, spaces, apostrophes, periods, or hyphens only.',
            'last_name.regex' => 'Use letters, numbers, spaces, apostrophes, periods, or hyphens only.',
            'line_id.regex' => 'Use 3 to 40 letters, numbers, dots, underscores, hyphens, or @ only.',
            'password.regex' => 'Password must include at least one letter and one number.',
        ];
    }

    private function sanitizeEmail(): string
    {
        $value = strtolower((string) $this->input('email', ''));

        return preg_replace('/\s+/', '', strip_tags($value)) ?? '';
    }

    private function sanitizeTextValue(string $key): string
    {
        $value = (string) $this->input($key, '');
        $value = strip_tags($value);
        $value = str_replace(['<', '>', '`'], '', $value);
        $value = preg_replace('/\s+/u', ' ', trim($value)) ?? '';

        return mb_substr($value, 0, match ($key) {
            'company_name' => 120,
            default => 60,
        });
    }

    private function sanitizeContactNumber(): string
    {
        $value = (string) $this->input('contact_number', '');
        $value = strip_tags($value);
        $value = preg_replace('/[^0-9+\-()\s]/', '', $value) ?? '';
        $value = preg_replace('/\s+/u', ' ', trim($value)) ?? '';

        return mb_substr($value, 0, 20);
    }

    private function sanitizeLineId(): ?string
    {
        $value = (string) $this->input('line_id', '');
        $value = strip_tags($value);
        $value = preg_replace('/[^A-Za-z0-9._@-]/', '', $value) ?? '';
        $value = mb_substr($value, 0, 40);

        return $value !== '' ? $value : null;
    }

    private function sanitizePassword(): ?string
    {
        $value = (string) $this->input('password', '');
        $value = preg_replace('/[\x00-\x1F\x7F]/', '', $value) ?? '';
        $value = trim($value);

        return $value !== '' ? mb_substr($value, 0, 72) : null;
    }

    private function sanitizeSimpleValue(string $key): string
    {
        $value = strtolower((string) $this->input($key, ''));
        $value = strip_tags($value);
        $value = preg_replace('/[^a-z0-9_-]/', '', $value) ?? '';

        return mb_substr($value, 0, 50);
    }
}
