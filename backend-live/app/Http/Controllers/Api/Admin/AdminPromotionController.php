<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminPromotionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Promotion::query()->withCount('products')->withCount('categories')->latest();
        if ($search = $request->query('search')) { $query->where(fn ($q) => $q->where('code', 'like', "%{$search}%")->orWhere('name', 'like', "%{$search}%")); }
        $page = $query->paginate(min(100, max(1, (int) $request->query('per_page', 25))));
        return response()->json(['data' => $page->getCollection()->map(fn ($promotion) => $this->payload($promotion)),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()]]);
    }

    public function show(Promotion $promotion): JsonResponse { return response()->json(['promotion' => $this->payload($promotion->load(['products:id,uuid,name', 'categories:id,uuid,name']))]); }
    public function store(Request $request): JsonResponse { return $this->save($request, new Promotion, 201); }
    public function update(Request $request, Promotion $promotion): JsonResponse { return $this->save($request, $promotion, 200); }

    public function archive(Request $request, Promotion $promotion): JsonResponse
    {
        $before = $promotion->toArray(); $promotion->update(['active' => false, 'archived_at' => now(), 'updated_by' => $request->user()->id]);
        $this->audit($request, 'promotion.archived', $promotion, $before); return response()->json(['promotion' => $this->payload($promotion->fresh())]);
    }

    private function save(Request $request, Promotion $promotion, int $status): JsonResponse
    {
        $values = $request->validate(['code' => ['required', 'string', 'max:64'], 'name' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string'],
            'discount_type' => ['required', Rule::in(['percentage', 'fixed'])], 'discount_value' => ['required', 'integer', 'min:1'],
            'minimum_subtotal_minor' => ['nullable', 'integer', 'min:0'], 'maximum_discount_minor' => ['nullable', 'integer', 'min:1'],
            'currency_code' => ['nullable', 'string', 'size:3'], 'starts_at' => ['nullable', 'date'], 'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'total_usage_limit' => ['nullable', 'integer', 'min:0'], 'per_user_usage_limit' => ['nullable', 'integer', 'min:0'],
            'active' => ['required', 'boolean'], 'applies_to' => ['required', Rule::in(['all', 'products', 'categories'])],
            'product_ids' => ['nullable', 'array'], 'product_ids.*' => ['integer', 'exists:products,id'],
            'category_ids' => ['nullable', 'array'], 'category_ids.*' => ['integer', 'exists:categories,id']]);
        $code = strtoupper(trim($values['code']));
        if (Promotion::query()->whereRaw('UPPER(code) = ?', [$code])->when($promotion->exists, fn ($q) => $q->whereKeyNot($promotion->id))->exists()) { throw ValidationException::withMessages(['code' => ['This promo code is already in use.']]); }
        if ($values['discount_type'] === 'percentage' && $values['discount_value'] > 10000) { throw ValidationException::withMessages(['discount_value' => ['Percentage discount cannot exceed 100%. Use basis points (1000 = 10%).']]); }
        if ($values['discount_type'] === 'fixed' && empty($values['currency_code'])) { throw ValidationException::withMessages(['currency_code' => ['Currency is required for a fixed discount.']]); }
        if ($promotion->archived_at && $values['active']) { throw ValidationException::withMessages(['active' => ['Archived promo codes cannot be reactivated.']]); }

        $before = $promotion->exists ? $promotion->toArray() : null;
        DB::transaction(function () use ($promotion, $values, $code, $request): void {
            $attributes = [...$values, 'code' => $code, 'currency_code' => isset($values['currency_code']) ? strtoupper($values['currency_code']) : null,
                'updated_by' => $request->user()->id];
            if (! $promotion->exists) { $attributes['created_by'] = $request->user()->id; }
            $promotion->fill($attributes)->save();
            $promotion->products()->sync($values['applies_to'] === 'products' ? ($values['product_ids'] ?? []) : []);
            $promotion->categories()->sync($values['applies_to'] === 'categories' ? ($values['category_ids'] ?? []) : []);
        });
        $this->audit($request, $before ? 'promotion.updated' : 'promotion.created', $promotion, $before);
        return response()->json(['promotion' => $this->payload($promotion->fresh()->load(['products:id,uuid,name', 'categories:id,uuid,name']))], $status);
    }

    private function payload(Promotion $promotion): array { return [...$promotion->toArray(), 'status' => $promotion->archived_at ? 'archived' : (! $promotion->active ? 'inactive' : ($promotion->starts_at?->isFuture() ? 'scheduled' : ($promotion->ends_at?->isPast() ? 'expired' : (($promotion->total_usage_limit !== null && $promotion->usage_count >= $promotion->total_usage_limit) ? 'exhausted' : 'active'))))]; }
    private function audit(Request $request, string $action, Promotion $promotion, ?array $before): void { AdminAuditLog::query()->create(['admin_user_id' => $request->user()->id, 'action' => $action, 'subject_type' => Promotion::class, 'subject_id' => $promotion->id, 'before_payload' => $before, 'after_payload' => $promotion->fresh()->toArray(), 'ip_address' => $request->ip(), 'user_agent' => substr((string) $request->userAgent(), 0, 1000)]); }
}
