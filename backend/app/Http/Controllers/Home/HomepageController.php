<?php

namespace App\Http\Controllers\Home;

use App\Http\Controllers\Controller;
use App\Http\Requests\Home\GetHomepageDataRequest;
use App\Http\Resources\Home\HomepageResource;
use App\Services\Home\HomepageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Js;

class HomepageController extends Controller
{
    public function __construct(
        private readonly HomepageService $service
    ) {}

    public function __invoke(GetHomepageDataRequest $request): JsonResponse|HomepageResource
    {
        try {
            $homepageData = $this->service->getHomepageData($request);
            return new HomepageResource($homepageData);
        } catch (\Exception $e) {
            logger('Homepage API Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
