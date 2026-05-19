<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $baseQuery = User::query()->whereIn('role', ['customer', 'supplier', 'partner']);

        return response()->json([
            'stats' => [
                'total_users' => (clone $baseQuery)->count(),
                'customers' => (clone $baseQuery)->where('role', 'customer')->count(),
                'suppliers' => (clone $baseQuery)->where('role', 'supplier')->count(),
                'partners' => (clone $baseQuery)->where('role', 'partner')->count(),
                'active_users' => (clone $baseQuery)->where('status', 'active')->count(),
            ],
        ]);
    }
}
