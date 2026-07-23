<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertUserAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $values = (array) $this->input('address_values', []);

        if (array_key_exists('phoneNumber', $values)) {
            $values['phoneNumber'] = $this->sanitizePhoneNumber((string) $values['phoneNumber']);
        }

        $this->merge(['address_values' => $values]);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'country_key' => ['required', 'string', Rule::in([
                'usa', 'uk', 'thailand', 'japan', 'singapore', 'taiwan', 'china', 'philippines', 'malaysia', 'indonesia', 'hongKong',
            ])],
            'address_values' => ['required', 'array', 'max:64'],
            'address_values.*' => ['nullable', 'string', 'max:500'],
            'address_values.phoneNumber' => [
                'required',
                'string',
                'max:20',
                'regex:/^\+?[0-9]{7,15}$/',
            ],
            'summary' => ['nullable', 'string', 'max:255'],
            'is_default' => ['nullable', 'boolean'],
        ];
    }

    private function sanitizePhoneNumber(string $value): string
    {
        $compact = preg_replace('/[^0-9+]/', '', strip_tags($value)) ?? '';

        if (substr_count($compact, '+') > 1) {
            return $compact;
        }

        if (str_starts_with($compact, '+')) {
            return '+'.preg_replace('/\D/', '', substr($compact, 1));
        }

        return preg_replace('/\D/', '', $compact) ?? '';
    }
}
