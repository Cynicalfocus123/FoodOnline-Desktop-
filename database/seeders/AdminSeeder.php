<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $name = trim((string) env('ADMIN_NAME', 'FoodOnlines Admin'));
        $email = strtolower(trim((string) env('ADMIN_EMAIL', '')));
        $password = (string) env('ADMIN_PASSWORD', '');

        if ($email === '' || $password === '' || $password === 'change-this-password') {
            throw new RuntimeException('Set ADMIN_EMAIL and a real ADMIN_PASSWORD in .env before running AdminSeeder.');
        }

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'first_name' => strtok($name, ' ') ?: 'FoodOnlines',
                'last_name' => trim(str_replace(strtok($name, ' ') ?: '', '', $name)) ?: 'Admin',
                'password' => Hash::make($password),
                'role' => 'admin',
                'status' => 'active',
                'registered_from' => 'seeder',
            ],
        );
    }
}
