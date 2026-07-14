<?php

return [
    'frontend_url' => env('FRONTEND_URL', env('APP_URL', 'http://localhost')),
    'catalog_currency' => strtoupper((string) env('FOODONLINES_CATALOG_CURRENCY', 'USD')),

    'media' => [
        'disk' => env('MEDIA_DISK', 'r2'),
        'uploads_enabled' => (bool) env('MEDIA_UPLOADS_ENABLED', false),
        'public_url' => rtrim((string) env('R2_PUBLIC_URL', 'https://media.foodonlines.com'), '/'),
        'upload_ttl_minutes' => (int) env('R2_UPLOAD_URL_TTL_MINUTES', 5),
        'allowed_mime_types' => ['image/jpeg', 'image/png', 'image/webp'],
        'max_dimension' => 8000,
        'max_size_bytes' => [
            'product_image' => 8 * 1024 * 1024,
            'brand_logo' => 4 * 1024 * 1024,
            'category_image' => 4 * 1024 * 1024,
            'category_icon' => 4 * 1024 * 1024,
            'category_desktop_banner' => 8 * 1024 * 1024,
            'category_mobile_banner' => 8 * 1024 * 1024,
        ],
    ],

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
