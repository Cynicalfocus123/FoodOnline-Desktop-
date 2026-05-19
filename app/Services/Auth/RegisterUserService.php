<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class RegisterUserService
{
    /**
     * @param  array<string, mixed>  $validated
     */
    public function handle(array $validated): User
    {
        return DB::transaction(function () use ($validated): User {
            $firstName = trim((string) $validated['first_name']);
            $lastName = trim((string) $validated['last_name']);
            $contactNumber = trim((string) $validated['contact_number']);
            $accountType = (string) $validated['role'];

            $attributes = [
                'company_name' => trim((string) $validated['company_name']),
                'email' => strtolower(trim((string) $validated['email'])),
                'first_name' => $firstName,
                'last_name' => $lastName,
                'line_id' => $this->nullableString($validated['line_id'] ?? null),
                'name' => trim($firstName.' '.$lastName),
                'password' => $this->hashPassword($validated['password'] ?? null),
                'registered_from' => $this->nullableString($validated['registered_from'] ?? 'website') ?? 'website',
                'role' => $accountType,
                'status' => 'active',
            ];

            if (Schema::hasColumn('users', 'phone')) {
                $attributes['phone'] = $contactNumber;
            }

            if (Schema::hasColumn('users', 'contact_number')) {
                $attributes['contact_number'] = $contactNumber;
            }

            if (Schema::hasColumn('users', 'account_type')) {
                $attributes['account_type'] = $accountType;
            }

            $user = User::query()->create($attributes);

            Event::dispatch(new Registered($user));

            return $user->fresh() ?? $user;
        });
    }

    private function hashPassword(mixed $password): ?string
    {
        if (! is_string($password) || trim($password) === '') {
            return null;
        }

        return Hash::make(trim($password));
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return trim($value);
    }
}
