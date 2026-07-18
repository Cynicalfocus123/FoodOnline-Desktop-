<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReturnRequest;
use App\Services\Commerce\ReturnService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminReturnController extends Controller
{
    public function index(Request $request): JsonResponse { $data = $request->validate(['status' => ['nullable', Rule::in(ReturnRequest::STATUSES)], 'search' => ['nullable', 'string', 'max:80'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]); $query = ReturnRequest::query()->with(['user', 'order', 'items.orderItem', 'media.upload'])->latest(); if (! empty($data['status'])) $query->where('status', $data['status']); if (! empty($data['search'])) $query->where(fn ($q) => $q->where('return_number', 'like', '%'.$data['search'].'%')->orWhereHas('order', fn ($o) => $o->where('order_number', 'like', '%'.$data['search'].'%'))); return response()->json(['data' => $query->paginate($data['per_page'] ?? 25)]); }
    public function show(ReturnRequest $returnRequest): JsonResponse { return response()->json(['return' => $returnRequest->load(['user', 'order', 'items.orderItem', 'items.orderItem.variant', 'media.upload'])]); }
    public function action(Request $request, ReturnRequest $returnRequest, ReturnService $service): JsonResponse { $data = $request->validate(['action' => ['required', Rule::in(['approve', 'reject', 'request_information', 'received', 'inspect', 'refund', 'close'])], 'reason' => ['nullable', 'string', 'max:2000'], 'amount_minor' => ['nullable', 'integer', 'min:1'], 'items' => ['nullable', 'array']]); return response()->json(['return' => $service->transition($returnRequest, $data['action'], $data, $request->user(), $request)]); }
}
