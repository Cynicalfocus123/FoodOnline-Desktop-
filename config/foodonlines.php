<?php

return [
    'frontend_url' => env('FRONTEND_URL', env('APP_URL', 'http://localhost')),

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
];
