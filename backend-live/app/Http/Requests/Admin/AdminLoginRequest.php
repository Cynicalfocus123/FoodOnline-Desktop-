<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AdminLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower(trim(strip_tags((string) $this->input('email', '')))),
            'password' => preg_replace('/[\x00-\x1F\x7F]/', '', (string) $this->input('password', '')) ?? '',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email:rfc', 'max:254'],
            'password' => ['required', 'string', 'min:10', 'max:72'],
            'mfa_code' => ['nullable', 'string', 'max:32'],
        ];
    }
}
