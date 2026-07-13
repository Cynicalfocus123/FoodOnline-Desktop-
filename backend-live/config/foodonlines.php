<?php

return [
    'frontend_url' => env('FRONTEND_URL', env('APP_URL', 'http://localhost')),
    'catalog_currency' => strtoupper((string) env('FOODONLINES_CATALOG_CURRENCY', 'USD')),

    'admin' => [
        'name' => env('ADMIN_NAME', 'FoodOnlines Admin'),
        'email' => env('ADMIN_EMAIL', ''),
        'password' => env('ADMIN_PASSWORD', ''),
        'contact_number' => env('ADMIN_CONTACT_NUMBER', '0000000000'),
        'company_name' => env('ADMIN_COMPANY_NAME', 'FoodOnlines.com'),
    ],

    'supported_account_types' => [
        'customer',
        'supplier',
        'partner',
    ],

    'tokens' => [
        'user_ttl_minutes' => (int) env('USER_TOKEN_TTL_MINUTES', 43200),
        'admin_ttl_minutes' => (int) env('ADMIN_TOKEN_TTL_MINUTES', 480),
    ],
];
