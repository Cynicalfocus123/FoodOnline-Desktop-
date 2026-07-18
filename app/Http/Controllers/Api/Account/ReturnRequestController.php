<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Models\ReturnRequest;
use App\Services\Commerce\ReturnService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReturnRequestController extends Controller
{
    public function index(Request $request): JsonResponse { return response()->json(['data' => $request->user()->returnRequests()->with(['items.orderItem', 'media'])->latest()->paginate(20)]); }
    public function store(Request $request, ReturnService $service): JsonResponse { $data = $request->validate(['order_uuid' => ['required', 'uuid'], 'requested_resolution' => ['required', 'string', 'max:32'], 'reason_code' => ['required', 'in:damaged,incorrect_item,missing_item,expired,quality_issue,not_as_described,changed_mind,other'], 'customer_explanation' => ['nullable', 'string', 'max:5000'], 'items' => ['required', 'array', 'min:1', 'max:50'], 'items.*.order_item_uuid' => ['required', 'uuid'], 'items.*.quantity' => ['required', 'integer', 'min:1']]); return response()->json(['return' => $service->create($request->user(), $data)], 201); }
    public function show(Request $request, ReturnRequest $returnRequest): JsonResponse { abort_unless($returnRequest->user_id === $request->user()->id, 404); return response()->json(['return' => $returnRequest->load(['items.orderItem', 'order', 'user', 'media'])]); }
    public function cancel(Request $request, ReturnRequest $returnRequest): JsonResponse { abort_unless($returnRequest->user_id === $request->user()->id, 404); abort_if(! in_array($returnRequest->status, ['requested', 'information_required'], true), 422, 'This return can no longer be cancelled.'); $returnRequest->update(['status' => 'cancelled', 'cancelled_at' => now()]); return response()->json(['return' => $returnRequest->fresh(['items'])]); }
}
