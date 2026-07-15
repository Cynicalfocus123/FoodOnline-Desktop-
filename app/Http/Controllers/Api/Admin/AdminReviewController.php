<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use App\Models\ReviewReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminReviewController extends Controller
{
    public function index(Request $request): JsonResponse { $data = $request->validate(['status' => ['nullable', Rule::in(ProductReview::STATUSES)], 'reported' => ['nullable', 'boolean'], 'per_page' => ['nullable', 'integer', 'min:1', 'max:100']]); $query = ProductReview::query()->with(['product', 'variant', 'user', 'media'])->withCount('votes')->latest(); if (! empty($data['status'])) $query->where('status', $data['status']); if (($data['reported'] ?? false)) $query->whereHas('reports', fn ($q) => $q->where('status', 'open')); return response()->json(['data' => $query->paginate($data['per_page'] ?? 25)]); }
    public function show(ProductReview $review): JsonResponse { return response()->json(['review' => $review->load(['product', 'variant', 'user', 'media', 'reports'])]); }
    public function action(Request $request, ProductReview $review): JsonResponse { $data = $request->validate(['action' => ['required', Rule::in(['approve', 'reject', 'hide', 'restore', 'notes'])], 'note' => ['nullable', 'string', 'max:2000']]); $status = ['approve' => 'published', 'reject' => 'rejected', 'hide' => 'hidden', 'restore' => 'published'][$data['action']] ?? $review->status; $review->forceFill(['status' => $status, 'published_at' => $status === 'published' ? ($review->published_at ?? now()) : $review->published_at])->save(); if ($data['action'] !== 'notes') ReviewReport::query()->where('product_review_id', $review->id)->where('status', 'open')->update(['status' => 'resolved', 'moderator_note' => $data['note'] ?? null, 'resolved_by' => $request->user()->id, 'resolved_at' => now()]); return response()->json(['review' => $review->fresh(['product', 'variant', 'user', 'media'])]); }
}
