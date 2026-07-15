<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminSupportController extends Controller
{
    public function index(Request $request): JsonResponse { return response()->json(['data' => SupportTicket::query()->with(['user', 'order'])->latest('last_message_at')->paginate(25)]); }
    public function show(SupportTicket $ticket): JsonResponse { return response()->json(['ticket' => $ticket->load(['user', 'order', 'messages'])]); }
    public function message(Request $request, SupportTicket $ticket): JsonResponse { $data = $request->validate(['body' => ['required', 'string', 'max:5000'], 'customer_visible' => ['boolean']]); $ticket->messages()->create(['uuid' => (string) Str::uuid(), 'admin_user_id' => $request->user()->id, 'body' => $data['body'], 'customer_visible' => $data['customer_visible'] ?? true]); $ticket->forceFill(['last_message_at' => now(), 'status' => 'pending_customer'])->save(); return response()->json(['ticket' => $ticket->fresh('messages')]); }
    public function close(SupportTicket $ticket): JsonResponse { $ticket->update(['status' => 'closed', 'closed_at' => now()]); return response()->json(['ticket' => $ticket->fresh()]); }
}
