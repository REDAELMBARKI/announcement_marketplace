<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OfferRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'offer_price' => 'required|numeric|min:0.01|max:999999.99',
            'message' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom error messages for validation.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'offer_price.required' => 'Please enter your offer price.',
            'offer_price.numeric' => 'Offer price must be a valid number.',
            'offer_price.min' => 'Offer price must be at least 0.01.',
            'offer_price.max' => 'Offer price is too high.',
            'message.max' => 'Message cannot exceed 500 characters.',
        ];
    }
}
