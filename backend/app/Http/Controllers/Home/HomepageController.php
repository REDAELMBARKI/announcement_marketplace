<?php

namespace App\Http\Controllers\Home;

use App\Http\Controllers\Controller;
use App\Http\Requests\Home\GetHomepageDataRequest;
use App\Http\Resources\Home\HomepageResource;
use App\Services\Home\HomepageService;
use Illuminate\Http\JsonResponse;

class HomepageController extends Controller
{
    public function __construct(
        private readonly HomepageService $service
    ) {}

    public function __invoke(GetHomepageDataRequest $request): JsonResponse
    {
        $homepageData = $this->service->getHomepageData($request);

        return response()->json(
            new HomepageResource($homepageData)
        );
    }
}
