<?php

namespace App\Repositories;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class ChatRepository
{
    /**
     * Find a conversation by its participants and product.
     */
    public function findConversationByParticipants(int $productId, int $buyerId, int $sellerId): ?Conversation
    {
        return Conversation::where('product_id', $productId)
            ->where('buyer_id', $buyerId)
            ->where('seller_id', $sellerId)
            ->first();
    }

    /**
     * Create a new conversation.
     */
    public function createConversation(array $data): Conversation
    {
        return Conversation::create($data);
    }

    /**
     * Get user's conversations with counts and relationships.
     */
    public function getUserConversations(int $userId): Collection
    {
        return Conversation::where('buyer_id', $userId)
            ->orWhere('seller_id', $userId)
            ->with([
                'product' => function ($query) {
                    $query->select('id', 'title', 'slug')->with('thumbnail');
                },
                'buyer:id,name,avatar_path',
                'seller:id,name,avatar_path'
            ])
            ->withCount(['messages as unread_count' => function ($query) use ($userId) {
                $query->where('sender_id', '!=', $userId)->where('is_read', false);
            }])
            ->orderBy('last_message_at', 'desc')
            ->get();
    }

    /**
     * Get messages for a conversation.
     */
    public function getConversationMessages(int $conversationId): Collection
    {
        return Message::where('conversation_id', $conversationId)
            ->with('sender:id,name,avatar_path')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Create a new message.
     */
    public function createMessage(array $data): Message
    {
        return Message::create($data);
    }

    /**
     * Mark messages as read in a conversation.
     */
    public function markMessagesAsRead(int $conversationId, int $userId): void
    {
        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);
    }

    /**
     * Update conversation last message timestamp.
     */
    public function updateLastMessageTime(Conversation $conversation): void
    {
        $conversation->update(['last_message_at' => now()]);
    }
}
