<?php

namespace App\Repositories;

use App\Models\FilterAttribute;
use Illuminate\Support\Collection;

class FilterAttributeRepository
{
    public function getAllGrouped(): Collection
    {
        return FilterAttribute::all()->pluck('data', 'group');
    }

    public function getByGroup(string $group): array
    {
        $attribute = FilterAttribute::where('group', $group)->first();
        return $attribute ? $attribute->data : [];
    }
}
