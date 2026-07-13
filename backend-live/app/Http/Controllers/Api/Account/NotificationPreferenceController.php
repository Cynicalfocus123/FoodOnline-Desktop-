<?php

namespace App\Http\Controllers\Api\Account;

use App\Http\Controllers\Controller;
use App\Models\UserNotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $preferences = $this->loadOrCreate($request);

        return response()->json([
            'preferences' => $this->toPayload($preferences),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_updates' => ['required', 'boolean'],
            'delivery_updates' => ['required', 'boolean'],
            'promotions_and_coupons' => ['required', 'boolean'],
            'back_in_stock_alerts' => ['required', 'boolean'],
            'saved_item_price_drops' => ['required', 'boolean'],
            'email_notifications' => ['required', 'boolean'],
            'sms_notifications' => ['required', 'boolean'],
            'push_notifications' => ['required', 'boolean'],
        ]);

        $preferences = $this->loadOrCreate($request);
        $preferences->forceFill($validated)->save();

        return response()->json([
            'message' => 'Notification preferences saved.',
            'preferences' => $this->toPayload($preferences),
        ]);
    }

    private function loadOrCreate(Request $request): UserNotificationPreference
    {
        $user = $request->user();

        return UserNotificationPreference::query()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'order_updates' => true,
                'delivery_updates' => true,
                'promotions_and_coupons' => true,
                'back_in_stock_alerts' => true,
                'saved_item_price_drops' => true,
                'email_notifications' => true,
                'sms_notifications' => false,
                'push_notifications' => true,
            ],
        );
    }

    /**
     * @return array<string, bool>
     */
    private function toPayload(UserNotificationPreference $preferences): array
    {
        return [
            'order_updates' => (bool) $preferences->order_updates,
            'delivery_updates' => (bool) $preferences->delivery_updates,
            'promotions_and_coupons' => (bool) $preferences->promotions_and_coupons,
            'back_in_stock_alerts' => (bool) $preferences->back_in_stock_alerts,
            'saved_item_price_drops' => (bool) $preferences->saved_item_price_drops,
            'email_notifications' => (bool) $preferences->email_notifications,
            'sms_notifications' => (bool) $preferences->sms_notifications,
            'push_notifications' => (bool) $preferences->push_notifications,
        ];
    }
}
