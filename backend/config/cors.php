<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'paths' => ['api/*', 'reports/*', 'ask-ai', 'sanctum/csrf-cookie'],



    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:8000',
        'http://localhost:4173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Content-Type',
        'Authorization',
        'X-Requested-With'
    ],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
