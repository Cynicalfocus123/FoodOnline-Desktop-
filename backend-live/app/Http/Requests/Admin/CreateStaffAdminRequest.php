<?php

namespace App\Http\Requests\Admin;

use App\Services\Security\AdminPermissionCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateStaffAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return AdminPermissionCatalog::isSuperAdmin($this->user());
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim(strip_tags((string) $this->input('name', ''))),
            'email' => strtolower(trim(strip_tags((string) $this->input('email', '')))),
            'status' => $this->input('status', 'active'),
        ]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:121'],
            'email' => ['required', 'email:rfc', 'max:254', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'confirmed', 'min:10', 'max:72', 'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/'],
            'staff_role' => ['required', Rule::in(AdminPermissionCatalog::roles())],
            'status' => ['required', Rule::in(['active', 'disabled'])],
            'staff_permissions' => ['sometimes', 'array'],
            'staff_permissions.*' => ['string', Rule::in(AdminPermissionCatalog::all())],
        ];
    }
}
