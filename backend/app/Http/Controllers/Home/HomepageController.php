<?php

namespace App\Http\Controllers\Home;

use App\Actions\Home\GetHomepageDataAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Home\GetHomepageDataRequest;
use App\Http\Resources\Home\HomepageResource;
use Illuminate\Http\JsonResponse;

class HomepageController extends Controller
{
    public function __construct(
        private readonly GetHomepageDataAction $action
    ) {}

    public function __invoke(GetHomepageDataRequest $request): JsonResponse
    {
        $data = $this->action->execute($request);
        
        return response()->json(
            new HomepageResource($data)
        );
    }
}
