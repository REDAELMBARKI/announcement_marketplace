<?php

return [

    'paths' => ['api/*', 'reports/*', 'ask-ai', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_merge(
        explode(',', env('FRONTEND_URL', 'http://localhost:5173')),
        ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'https://letsbeus.freeddns.org', 'http://letsbeus.freeddns.org']
    ),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
