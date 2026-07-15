<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AdminAuditLog::query()->latest('created_at');
        if ($request->filled('action')) $query->where('action', 'like', '%' . $request->string('action') . '%');
        if ($request->filled('subject_type')) $query->where('subject_type', $request->string('subject_type'));
        if ($request->filled('admin_user_id')) $query->where('admin_user_id', $request->integer('admin_user_id'));
        if ($request->date('from')) $query->where('created_at', '>=', $request->date('from')->startOfDay());
        if ($request->date('to')) $query->where('created_at', '<=', $request->date('to')->endOfDay());
        $page = $query->paginate(min(100, max(1, (int) $request->query('per_page', 50))));
        return response()->json(['data' => $page->items(), 'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()]]);
    }
}
