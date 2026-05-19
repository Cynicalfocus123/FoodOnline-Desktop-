<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdminSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim(strip_tags((string) $this->input('name', ''))),
            'email' => strtolower(trim(strip_tags((string) $this->input('email', '')))),
            'current_password' => preg_replace('/[\x00-\x1F\x7F]/', '', (string) $this->input('current_password', '')) ?? '',
            'password' => $this->input('password') !== null
                ? (preg_replace('/[\x00-\x1F\x7F]/', '', (string) $this->input('password')) ?? '')
                : null,
            'password_confirmation' => $this->input('password_confirmation') !== null
                ? (preg_replace('/[\x00-\x1F\x7F]/', '', (string) $this->input('password_confirmation')) ?? '')
                : null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:121'],
            'email' => [
                'required',
                'string',
                'email:rfc',
                'max:254',
                Rule::unique('users', 'email')->ignore($this->user()?->id),
            ],
            'current_password' => ['required', 'string', 'min:10', 'max:72'],
            'password' => ['nullable', 'string', 'confirmed', 'min:10', 'max:72', 'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/'],
        ];
    }
}
