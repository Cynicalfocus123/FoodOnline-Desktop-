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

    'commerce' => [
        'store_currency' => strtoupper((string) env('COMMERCE_CURRENCY', env('FOODONLINES_CATALOG_CURRENCY', 'USD'))),
        'shipping_enabled' => (bool) env('COMMERCE_SHIPPING_ENABLED', true),
        'standard_shipping_minor' => (int) env('COMMERCE_STANDARD_SHIPPING_MINOR', 599),
        'free_shipping_threshold_minor' => (int) env('COMMERCE_FREE_SHIPPING_THRESHOLD_MINOR', 4900),
        'supported_countries' => array_values(array_filter(explode(',', (string) env('COMMERCE_SUPPORTED_COUNTRIES', 'thailand,japan,singapore,taiwan,china,philippines,malaysia,indonesia,hongKong')))),
        'cod_enabled' => (bool) env('COMMERCE_COD_ENABLED', true),
        'cod_fee_minor' => (int) env('COMMERCE_COD_FEE_MINOR', 0),
        'cod_minimum_minor' => (int) env('COMMERCE_COD_MINIMUM_MINOR', 0),
        'cod_maximum_minor' => env('COMMERCE_COD_MAXIMUM_MINOR') !== null ? (int) env('COMMERCE_COD_MAXIMUM_MINOR') : null,
        'cod_supported_countries' => array_values(array_filter(explode(',', (string) env('COMMERCE_COD_COUNTRIES', 'thailand,japan,singapore,taiwan,china,philippines,malaysia,indonesia,hongKong')))),
        'guest_checkout_enabled' => (bool) env('COMMERCE_GUEST_CHECKOUT_ENABLED', true),
        'reservation_minutes' => (int) env('COMMERCE_RESERVATION_MINUTES', 30),
        'quote_minutes' => (int) env('COMMERCE_QUOTE_MINUTES', 15),
        'order_cancellation_minutes' => (int) env('COMMERCE_ORDER_CANCELLATION_MINUTES', 60),
        'tax_mode' => env('COMMERCE_TAX_MODE', 'disabled'),
        'flat_tax_basis_points' => (int) env('COMMERCE_FLAT_TAX_BASIS_POINTS', 0),
        'order_support_email' => env('COMMERCE_ORDER_SUPPORT_EMAIL', 'support@foodonlines.com'),
        'order_notification_email' => env('COMMERCE_ORDER_NOTIFICATION_EMAIL', 'orders@foodonlines.com'),
    ],
];
