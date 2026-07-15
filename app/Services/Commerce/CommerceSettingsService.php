<?php

namespace App\Services\Commerce;

use App\Models\AdminAuditLog;
use App\Models\CommerceSetting;
use App\Models\User;
use Illuminate\Http\Request;

class CommerceSettingsService
{
    public function defaults(): array
    {
        return config('foodonlines.commerce', []);
    }

    public function all(): array
    {
        return array_replace($this->defaults(), CommerceSetting::query()->pluck('value', 'key')->all());
    }

    public function update(array $values, User $admin, Request $request): array
    {
        $before = $this->all();
        foreach ($values as $key => $value) {
            CommerceSetting::query()->updateOrCreate(['key' => $key], ['value' => $value, 'updated_by' => $admin->id]);
        }
        $after = $this->all();
        AdminAuditLog::query()->create([
            'admin_user_id' => $admin->id, 'action' => 'commerce_settings.updated', 'subject_type' => CommerceSetting::class,
            'before_payload' => $before, 'after_payload' => $after, 'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 1000),
        ]);

        return $after;
    }
}
