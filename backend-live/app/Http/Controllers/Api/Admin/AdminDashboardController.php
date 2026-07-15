<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Order;
use App\Models\VariantInventory;
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
                'total_categories' => Category::query()->count(),
                'total_brands' => Brand::query()->count(),
                'total_products' => Product::query()->count(),
                'published_products' => Product::query()->published()->count(),
                'draft_products' => Product::query()->drafts()->count(),
                'archived_products' => Product::query()->archived()->count(),
                'out_of_stock_default_variants' => ProductVariant::query()->where('is_default', true)->where('is_active', true)->where('availability_status', 'out_of_stock')->count(),
                'orders_today' => Order::query()->whereDate('placed_at', today())->count(),
                'pending_orders' => Order::query()->whereIn('order_status', ['pending', 'confirmed', 'processing'])->count(),
                'cod_pending_collection' => Order::query()->where('payment_method_code', 'cod')->where('payment_status', 'pending')->count(),
                'revenue_minor' => Order::query()->where('payment_status', 'paid')->sum('paid_minor'),
                'low_stock_variants' => VariantInventory::query()->where('tracking_enabled', true)->whereRaw('(quantity_on_hand - quantity_reserved) <= low_stock_threshold')->count(),
            ],
        ]);
    }
}
