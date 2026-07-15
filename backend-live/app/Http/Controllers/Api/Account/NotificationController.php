<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse { $page = $request->user()->notifications()->latest()->paginate(20); return response()->json(['data' => $page->getCollection()->map(fn ($notification) => ['id' => $notification->id, 'type' => $notification->type, 'data' => $notification->data, 'read_at' => $notification->read_at?->toIso8601String(), 'created_at' => $notification->created_at?->toIso8601String()]), 'unread_count' => $request->user()->unreadNotifications()->count(), 'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage()]]); }
    public function read(Request $request, string $notification): JsonResponse { $item = $request->user()->notifications()->whereKey($notification)->firstOrFail(); $item->markAsRead(); return response()->json(['message' => 'Notification marked read.']); }
    public function readAll(Request $request): JsonResponse { $request->user()->unreadNotifications->each->markAsRead(); return response()->json(['message' => 'Notifications marked read.']); }
    public function destroy(Request $request, string $notification): JsonResponse { $request->user()->notifications()->whereKey($notification)->delete(); return response()->json(['message' => 'Notification removed.']); }
}
