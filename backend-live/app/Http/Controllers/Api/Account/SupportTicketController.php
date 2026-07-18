<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SupportTicketController extends Controller
{
    public function index(Request $request): JsonResponse { return response()->json(['data' => $request->user()->supportTickets()->with(['messages', 'media.upload'])->latest()->paginate(20)]); }
    public function store(Request $request): JsonResponse { $data = $request->validate(['subject' => ['required', 'string', 'max:180'], 'body' => ['required', 'string', 'max:5000'], 'order_uuid' => ['nullable', 'uuid']]); $ticket = SupportTicket::query()->create(['uuid' => (string) Str::uuid(), 'ticket_number' => 'SUP-'.now()->format('ymd').'-'.strtoupper(Str::random(6)), 'user_id' => $request->user()->id, 'order_id' => $data['order_uuid'] ? $request->user()->orders()->where('uuid', $data['order_uuid'])->value('id') : null, 'subject' => $data['subject'], 'last_message_at' => now()]); $ticket->messages()->create(['uuid' => (string) Str::uuid(), 'user_id' => $request->user()->id, 'body' => $data['body'], 'customer_visible' => true]); return response()->json(['ticket' => $ticket->load('messages')], 201); }
    public function show(Request $request, SupportTicket $ticket): JsonResponse { abort_unless($ticket->user_id === $request->user()->id, 404); return response()->json(['ticket' => $ticket->load(['messages', 'media.upload'])]); }
    public function message(Request $request, SupportTicket $ticket): JsonResponse { abort_unless($ticket->user_id === $request->user()->id, 404); $data = $request->validate(['body' => ['required', 'string', 'max:5000']]); $ticket->messages()->create(['uuid' => (string) Str::uuid(), 'user_id' => $request->user()->id, 'body' => $data['body'], 'customer_visible' => true]); $ticket->forceFill(['status' => 'open', 'last_message_at' => now()])->save(); return response()->json(['ticket' => $ticket->fresh('messages')]); }
}
