<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

interface ProductRepositoryInterface
{
    public function getAllActive(): Collection;
    
    public function getById(int $id): ?Product;
    
    public function getByUserId(int $userId): Collection;
    
    public function delete(int $id): bool;
}
