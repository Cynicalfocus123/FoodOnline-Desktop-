<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminManagedUserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class AdminUsersController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'account_type' => ['nullable', 'string', Rule::in(['customer', 'supplier', 'partner'])],
            'role' => ['nullable', 'string', Rule::in(['customer', 'supplier', 'partner'])],
        ]);
        $accountType = $validated['account_type'] ?? $validated['role'] ?? null;
        $accountTypeColumn = Schema::hasColumn('users', 'account_type') ? 'account_type' : 'role';

        $users = User::query()
            ->whereIn($accountTypeColumn, ['customer', 'supplier', 'partner'])
            ->when($accountType, fn ($query, string $role) => $query->where($accountTypeColumn, $role))
            ->latest()
            ->get();

        return response()->json([
            'users' => AdminManagedUserResource::collection($users),
        ]);
    }
}
