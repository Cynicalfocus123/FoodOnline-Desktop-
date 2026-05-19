<?php

return [
    'frontend_url' => env('FRONTEND_URL', env('APP_URL', 'http://localhost')),

    'supported_account_types' => [
        'customer',
        'supplier',
        'partner',
    ],
];
