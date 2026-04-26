<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Assume authorization is handled elsewhere or allowed for now
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');
        $required = $isUpdate ? 'sometimes|required' : 'required';

        return [
            'super_category_id' => "$required|exists:categories,id",
            'listing_mode'      => "$required|in:sell,donate",
            'listing_type'      => "$required|in:single,collection",
            'title'             => "$required|string|max:255",
            'description'       => 'nullable|string',
            'price'             => 'nullable|numeric|min:0',
            'currency'          => 'nullable|string|max:10',
            'price_negotiable'  => 'nullable|boolean',
            'condition'         => 'nullable|string',
            'gender'            => 'nullable|string',
            'age_range'         => 'nullable|string',
            'brand'             => 'nullable|string',
            'season'            => 'nullable|string',
            'sizes'             => 'nullable|array',
            'colors'            => 'nullable|array',
            'pickup_address'    => 'nullable|string',
            'handover_method'   => 'nullable|string',
            'phone_contact'     => [$required, 'string', 'regex:/^(?:\+212|0|212)[5-7]\d{8}$/'],
            'sub_category_ids'  => 'nullable|array',
            'sub_category_ids.*' => 'exists:categories,id',
            'media_ids'         => 'nullable|array',
            'media_ids.*'       => 'exists:media,id',
            'user_id'           => 'required|exists:users,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'phone_contact.regex' => 'Le numéro de téléphone doit être un numéro marocain valide.',
        ];
    }
}
