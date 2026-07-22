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
            'summary' => ['nullable', 'string', 'max:255'],
            'is_default' => ['nullable', 'boolean'],
        ];
    }
}
