<?php

namespace App\Http\Controllers;

use App\Models\Charity;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Schema;

class FoundationController extends Controller
{
    public function index(): JsonResponse
    {
        if (! Schema::hasTable('Charity')) {
            return response()->json([
                'status' => 'success',
                'foundations' => [],
            ]);
        }

        $rows = Charity::query()
            ->orderBy('charity_name')
            ->get()
            ->map(fn ($c) => [
                'id' => (int) $c->charity_ID,
                'name' => $c->charity_name,
                'email' => $c->charity_email,
                'address' => $c->charity_address,
                'contact_person' => $c->contact_person,
                'phone' => $c->charity_phone,
            ])
            ->values()
            ->all();

        return response()->json([
            'status' => 'success',
            'foundations' => $rows,
        ]);
    }
}
