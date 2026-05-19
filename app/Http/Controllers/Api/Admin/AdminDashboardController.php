<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Schema;

class AdminDashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $accountTypeColumn = Schema::hasColumn('users', 'account_type') ? 'account_type' : 'role';
        $baseQuery = User::query()->whereIn($accountTypeColumn, ['customer', 'supplier', 'partner']);

        return response()->json([
            'stats' => [
                'total_users' => (clone $baseQuery)->count(),
                'customers' => (clone $baseQuery)->where($accountTypeColumn, 'customer')->count(),
                'suppliers' => (clone $baseQuery)->where($accountTypeColumn, 'supplier')->count(),
                'partners' => (clone $baseQuery)->where($accountTypeColumn, 'partner')->count(),
                'active_users' => (clone $baseQuery)->where('status', 'active')->count(),
            ],
        ]);
    }
}
