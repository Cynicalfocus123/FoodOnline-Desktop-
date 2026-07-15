<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ReturnRequest;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
    public function summary(Request $request): Response|\Illuminate\Http\JsonResponse
    {
        $from = $request->date('from')?->startOfDay() ?? now()->subDays(30)->startOfDay(); $to = $request->date('to')?->endOfDay() ?? now()->endOfDay();
        $orders = Order::query()->whereBetween('placed_at', [$from, $to]);
        return response()->json(['period' => ['from' => $from->toIso8601String(), 'to' => $to->toIso8601String()], 'orders' => ['count' => (clone $orders)->count(), 'gross_minor' => (int) (clone $orders)->sum('total_minor'), 'paid_minor' => (int) (clone $orders)->sum('paid_minor'), 'cod_outstanding_minor' => (int) (clone $orders)->where('payment_method_code', 'cod')->where('payment_status', 'pending')->sum('total_minor'), 'cancelled_minor' => (int) (clone $orders)->where('order_status', 'cancelled')->sum('total_minor')], 'returns' => ['count' => ReturnRequest::query()->whereBetween('requested_at', [$from, $to])->count(), 'refunded_minor' => (int) ReturnRequest::query()->whereBetween('requested_at', [$from, $to])->sum('refund_amount_minor')], 'top_products' => DB::table('order_items')->select('product_name', DB::raw('SUM(quantity) as units'), DB::raw('SUM(line_total_minor) as value_minor'))->whereBetween('created_at', [$from, $to])->groupBy('product_name')->orderByDesc('units')->limit(20)->get()]);
    }
    public function ordersCsv(Request $request): Response { return $this->csv($request, 'orders.csv', ['order_number', 'placed_at', 'status', 'payment_status', 'total_minor'], Order::query()->whereBetween('placed_at', [$request->date('from')?->startOfDay() ?? now()->subDays(30)->startOfDay(), $request->date('to')?->endOfDay() ?? now()->endOfDay()])); }
    private function csv(Request $request, string $filename, array $headers, $query): Response { $body = fopen('php://temp', 'r+'); fputcsv($body, $headers); $query->orderBy('id')->chunkById(500, function ($rows) use ($body): void { foreach ($rows as $row) { fputcsv($body, array_values((array) $row)); } }); rewind($body); $contents = stream_get_contents($body) ?: ''; fclose($body); return response($contents, 200, ['Content-Type' => 'text/csv; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="'.$filename.'"']); }
}
