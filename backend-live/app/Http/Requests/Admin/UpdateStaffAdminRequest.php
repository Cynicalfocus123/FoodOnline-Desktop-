<?php

namespace App\Http\Requests\Admin;

use App\Services\Security\AdminPermissionCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStaffAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return AdminPermissionCatalog::isSuperAdmin($this->user());
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:121'],
            'email' => ['sometimes', 'required', 'email:rfc', 'max:254', Rule::unique('users', 'email')->ignore($this->route('user')?->id)],
            'staff_role' => ['sometimes', 'required', Rule::in(AdminPermissionCatalog::roles())],
            'status' => ['sometimes', 'required', Rule::in(['active', 'disabled'])],
            'staff_permissions' => ['sometimes', 'array'],
            'staff_permissions.*' => ['string', Rule::in(AdminPermissionCatalog::all())],
        ];
    }
}
