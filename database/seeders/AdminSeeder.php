<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $name = trim((string) env('ADMIN_NAME', 'FoodOnlines Admin'));
        $email = strtolower(trim((string) env('ADMIN_EMAIL', '')));
        $password = (string) env('ADMIN_PASSWORD', '');
        [$firstName, $lastName] = $this->splitName($name);

        if ($email === '' || $password === '' || $password === 'change-this-password') {
            throw new RuntimeException('Set ADMIN_EMAIL and a real ADMIN_PASSWORD in .env before running AdminSeeder.');
        }

        $values = [
            'name' => $name,
            'password' => Hash::make($password),
        ];

        if (Schema::hasColumn('users', 'first_name')) {
            $values['first_name'] = $firstName;
        }

        if (Schema::hasColumn('users', 'last_name')) {
            $values['last_name'] = $lastName;
        }

        if (Schema::hasColumn('users', 'role')) {
            $values['role'] = 'admin';
        }

        if (Schema::hasColumn('users', 'status')) {
            $values['status'] = 'active';
        }

        if (Schema::hasColumn('users', 'registered_from')) {
            $values['registered_from'] = 'seeder';
        }

        User::query()->updateOrCreate(['email' => $email], $values);
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function splitName(string $name): array
    {
        $parts = preg_split('/\s+/', trim($name)) ?: [];
        $firstName = $parts[0] ?? 'FoodOnlines';
        $lastName = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : 'Admin';

        return [$firstName, $lastName];
    }
}
