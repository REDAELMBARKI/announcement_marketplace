<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OpenAIController extends Controller
{
    public function ask(Request $request)
    {
        // validate input
        $request->validate([
            'question' => 'required|string',
        ]);

        $question = $request->input('question');

        // checks if API key is set
        $apiKey = env('OPENAI_API_KEY');
        if (!$apiKey) {
            return response()->json([
                'answer' => 'api key is missing.'
            ], 500);
        }

        try {
            $client = \OpenAI::client($apiKey);

            $faqContext = "
            FAQ for LetUsDonate:
            1. What makes LetUsDonate Different?
            - Eco-friendly donations.
            - Choose collection or drop-off.
            - Track your impact.

            2. What can I donate?
            - Clothing, shoes, handbags, belts, etc.

            3. How do I book a collection?
            - Create account.
            - Fill donation form.
            - Choose date/time/location.

            4. How much goes to charity?
            - 100% of profits go to chosen charity.
            ";

            $response = $client->chat()->create([
                'model' => 'gpt-3.5-turbo-0125',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a FAQs bot.'],
                    ['role' => 'system', 'content' => $faqContext],
                    ['role' => 'user', 'content' => $question],
                ],
            ]);

            $answer = $response->choices[0]->message->content ?? 
                      "Sorry, I could not generate a response.";

            return response()->json(['answer' => $answer]);

        } catch (\OpenAI\Exceptions\RateLimitException $e) {
            Log::warning('Openai rate limit exceeded: '.$e->getMessage());
            return response()->json([
                'answer' => 'Please try again later.'
            ], 429);
        
        } catch (\Exception $e) {
            Log::error('Openai general error: '.$e->getMessage());
            return response()->json([
                'answer' => 'Service error: '.$e->getMessage()
            ], 500);
        }
    }
}
