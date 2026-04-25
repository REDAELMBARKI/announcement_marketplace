<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

use App\Http\Controllers\Home\HomepageController;
use App\Http\Requests\Home\GetHomepageDataRequest;
use Illuminate\Support\Facades\Request;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

try {
    $request = GetHomepageDataRequest::create('/api/homepage', 'GET');
    $response = $kernel->handle($request);
    echo $response->getContent();
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
