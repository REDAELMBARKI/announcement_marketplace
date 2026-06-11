<?php

namespace App\Http\Middleware;

use Closure;

class SecurityHeaders
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        // CSP header - expanded for development and external assets
        $response->headers->set('Content-Security-Policy',
            "default-src 'self' *; " .
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' *; " .
            "style-src 'self' 'unsafe-inline' *; " .
            "img-src 'self' data: *; " .
            "font-src 'self' data: *; " .
            "connect-src 'self' *; "
        );

        // Clickjacking protection
        $response->headers->set('X-Frame-Options', 'DENY');

        return $response;
    }
}
