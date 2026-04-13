<?php

namespace App\Http\Middleware;

use Closure;

class SecurityHeaders
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        // CSP header
        $response->headers->set('Content-Security-Policy',
            "default-src 'self'; " .
            "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " .
            "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " .
            "img-src 'self' data:; " .
            "font-src 'self' https://cdnjs.cloudflare.com; " .
            "connect-src 'self' http://127.0.0.1:8000 http://localhost:5173; "
        );

        // Clickjacking protection
        $response->headers->set('X-Frame-Options', 'DENY');

        return $response;
    }
}
