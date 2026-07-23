<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Hash;

require dirname(__DIR__, 2).'/vendor/autoload.php';

$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$command = $argv[1] ?? '';

if ($command === 'seed-admin') {
    $email = $argv[2] ?? '';
    $password = $argv[3] ?? '';
    if ($email === '' || $password === '') {
        throw new RuntimeException('Admin email and password are required.');
    }

    $admin = User::query()->updateOrCreate(
        ['email' => strtolower($email)],
        [
            'name' => 'Address Acceptance Admin',
            'first_name' => 'Address',
            'last_name' => 'Admin',
            'password' => Hash::make($password),
            'role' => 'admin',
            'status' => 'active',
            'registered_from' => 'automated_acceptance',
        ],
    );

    echo json_encode(['admin_id' => $admin->id], JSON_THROW_ON_ERROR);
    exit(0);
}

if ($command === 'inspect-user') {
    $email = $argv[2] ?? '';
    $user = User::query()->where('email', strtolower($email))->firstOrFail();
    $addresses = $user->addresses()
        ->orderByDesc('is_default')
        ->orderBy('id')
        ->get()
        ->map(fn ($address): array => [
            'id' => $address->id,
            'user_id' => $address->user_id,
            'country_key' => $address->country_key,
            'address_values' => $address->address_values,
            'summary' => $address->summary,
            'is_default' => (bool) $address->is_default,
        ])
        ->values();

    echo json_encode([
        'user_id' => $user->id,
        'email' => $user->email,
        'addresses' => $addresses,
    ], JSON_THROW_ON_ERROR);
    exit(0);
}

throw new RuntimeException('Unknown address acceptance support command.');
