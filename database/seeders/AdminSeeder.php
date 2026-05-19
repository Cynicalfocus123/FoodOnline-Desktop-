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
        $contactNumber = trim((string) env('ADMIN_CONTACT_NUMBER', '0000000000'));
        $companyName = trim((string) env('ADMIN_COMPANY_NAME', 'FoodOnlines.com'));
        [$firstName, $lastName] = $this->splitName($name);

        if ($email === '') {
            throw new RuntimeException('Set ADMIN_EMAIL in .env before running AdminSeeder.');
        }

        if ($password === '' || $password === 'change-this-password') {
            throw new RuntimeException('Set ADMIN_PASSWORD to a real value in .env before running AdminSeeder.');
        }

        $values = [
            'name' => $name,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'password' => Hash::make($password),
            'company_name' => $companyName !== '' ? $companyName : 'FoodOnlines.com',
            'role' => 'admin',
            'status' => 'active',
            'registered_from' => 'seeder',
        ];

        if (Schema::hasColumn('users', 'contact_number')) {
            $values['contact_number'] = $contactNumber !== '' ? $contactNumber : '0000000000';
        }

        if (Schema::hasColumn('users', 'phone')) {
            $values['phone'] = $contactNumber !== '' ? $contactNumber : '0000000000';
        }

        $allowedColumns = array_filter(
            $values,
            static fn (string $column): bool => Schema::hasColumn('users', $column),
            ARRAY_FILTER_USE_KEY,
        );

        User::query()->updateOrCreate(['email' => $email], $allowedColumns);
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
