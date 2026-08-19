<?php

namespace App\Http\Requests\Admin;

use App\Services\Security\AdminPermissionCatalog;
use Illuminate\Foundation\Http\FormRequest;

class ResetStaffPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return AdminPermissionCatalog::isSuperAdmin($this->user());
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'password' => ['required', 'string', 'confirmed', 'min:10', 'max:72', 'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/'],
        ];
    }
}
