<?php

namespace App\Actions\Home;

use App\DTOs\Home\HomepageDataDTO;
use App\Http\Requests\Home\GetHomepageDataRequest;
use App\Services\Home\HomepageService;

class GetHomepageDataAction
{
    public function __construct(
        private readonly HomepageService $service
    ) {}

    public function execute(GetHomepageDataRequest $request): HomepageDataDTO
    {
        return $this->service->getHomepageData($request);
    }
}
