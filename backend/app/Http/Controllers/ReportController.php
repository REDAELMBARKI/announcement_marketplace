<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function donations(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => []
        ]);
    }

    public function users(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => []
        ]);
    }

    public function sustainability(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => []
        ]);
    }

    public function charities(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => []
        ]);
    }
}
