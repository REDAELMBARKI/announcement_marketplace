<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Product;
use App\Repositories\ChatRepository;
use Illuminate\Support\Facades\Auth;
use App\Events\MessageSent;
use App\Events\MessageRead;
use Illuminate\Database\Eloquent\Collection;

class ChatService
{
    protected $chatRepository;

    public function __construct(ChatRepository $chatRepository)
    {
        $this->chatRepository = $chatRepository;
    }

    /**
     * Get or create a conversation between buyer and seller for a product.
     */
    public function getOrCreateConversation(Product $product): Conversation
    {
        $buyerId = Auth::id();
        $sellerId = $product->user_id;

        $conversation = $this->chatRepository->findConversationByParticipants(
            $product->id, 
            $buyerId, 
            $sellerId
        );

        if (!$conversation) {
            $conversation = $this->chatRepository->createConversation([
                'product_id' => $product->id,
                'buyer_id' => $buyerId,
                'seller_id' => $sellerId,
            ]);
        }

        return $conversation->load(['product:id,title,slug,thumbnail', 'buyer:id,name,avatar', 'seller:id,name,avatar']);
    }

    /**
     * Get messages for a conversation.
     */
    public function getMessages(Conversation $conversation): Collection
    {
        $userId = Auth::id();

        // Mark unread messages as read through repository
        $this->chatRepository->markMessagesAsRead($conversation->id, $userId);

        return $this->chatRepository->getConversationMessages($conversation->id);
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(Conversation $conversation, string $content): Message
    {
        $userId = Auth::id();

        $message = $this->chatRepository->createMessage([
            'conversation_id' => $conversation->id,
            'sender_id' => $userId,
            'content' => $content,
            'is_read' => false,
        ]);

        // Update conversation's last message time through repository
        $this->chatRepository->updateLastMessageTime($conversation);

        // Load sender info for response
        $message->load('sender:id,name,avatar');

        // Broadcast the message via Reverb
        broadcast(new MessageSent($message, $conversation))->toOthers();

        return $message;
    }

    /**
     * Get user's conversations.
     */
    public function getUserConversations(): Collection
    {
        $userId = Auth::id();
        return $this->chatRepository->getUserConversations($userId);
    }

    /**
     * Mark messages as read.
     */
    public function markAsRead(Conversation $conversation): void
    {
        $userId = Auth::id();
        $this->chatRepository->markMessagesAsRead($conversation->id, $userId);
        broadcast(new MessageRead($conversation->id, $userId))->toOthers();
    }
}
