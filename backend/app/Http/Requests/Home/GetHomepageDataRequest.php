<?php

namespace App\Http\Requests\Home;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GetHomepageDataRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'city' => ['sometimes', 'string', 'max:100'],
            'age' => ['sometimes', 'string', 'max:50'],
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
        ];
    }

    public function getCity(): ?string
    {
        return $this->validated('city');
    }

    public function getAge(): ?string
    {
        return $this->validated('age');
    }

    public function getCategoryId(): ?int
    {
        return $this->validated('category_id');
    }
}
