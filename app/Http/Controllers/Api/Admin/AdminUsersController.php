<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminManagedUserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminUsersController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['nullable', 'string', Rule::in(['customer', 'supplier', 'partner'])],
        ]);

        $users = User::query()
            ->whereIn('role', ['customer', 'supplier', 'partner'])
            ->when($validated['role'] ?? null, fn ($query, string $role) => $query->where('role', $role))
            ->latest()
            ->get();

        return response()->json([
            'users' => AdminManagedUserResource::collection($users),
        ]);
    }
}
