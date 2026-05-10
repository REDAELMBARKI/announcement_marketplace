<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    public function run(): void
    {
        $conversations = Conversation::all();

        foreach ($conversations as $conversation) {
            $buyer = $conversation->buyer;
            $seller = $conversation->seller;

            if (!$buyer || !$seller) continue;

            $messages = [
                [
                    'sender_id' => $buyer->id,
                    'content' => "Hi, I'm interested in '{$conversation->product->title}'. Is it still available?",
                ],
                [
                    'sender_id' => $seller->id,
                    'content' => "Hello! Yes, it is still available. Would you like to see more pictures?",
                ],
                [
                    'sender_id' => $buyer->id,
                    'content' => "That would be great! Also, is the price negotiable?",
                ],
                [
                    'sender_id' => $seller->id,
                    'content' => "I can offer a small discount if you can pick it up this weekend.",
                ],
            ];

            foreach ($messages as $index => $msgData) {
                Message::create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $msgData['sender_id'],
                    'content' => $msgData['content'],
                    'is_read' => $index < 3, // Last message unread
                    'created_at' => now()->subMinutes((4 - $index) * 5),
                ]);
            }
        }
    }
}
