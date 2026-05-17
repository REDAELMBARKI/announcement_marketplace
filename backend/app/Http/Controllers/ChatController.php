<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\MessageSent;
use App\Events\MessageRead;

use App\Services\ChatService;

class ChatController extends Controller
{
    protected $chatService;

    public function __construct(ChatService $chatService)
    {
        $this->chatService = $chatService;
    }

    /**
     * Get or create a conversation between buyer and seller for a product.
     */
    public function getOrCreateConversation(Product $product)
    {
        $buyerId = Auth::id();
        $sellerId = $product->user_id;

        // Can't chat with yourself
        if ($buyerId === $sellerId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot chat with yourself',
            ], 422);
        }

        $conversation = $this->chatService->getOrCreateConversation($product);

        return response()->json([
            'status' => 'success',
            'conversation' => $conversation,
        ]);
    }

    /**
     * Get messages for a conversation.
     */
    public function getMessages(Conversation $conversation)
    {
        // Verify user is part of this conversation
        $userId = Auth::id();
        if ($conversation->buyer_id !== $userId && $conversation->seller_id !== $userId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
            ], 403);
        }

        $messages = $this->chatService->getMessages($conversation);

        return response()->json([
            'status' => 'success',
            'messages' => $messages,
            'conversation' => $conversation->load([
                'product' => function ($query) {
                    $query->select('id', 'title', 'slug')->with('thumbnail');
                },
                'buyer:id,name,avatar_path',
                'seller:id,name,avatar_path'
            ]),
        ]);
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(Request $request, Conversation $conversation)
    {
        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        // Verify user is part of this conversation
        $userId = Auth::id();
        if ($conversation->buyer_id !== $userId && $conversation->seller_id !== $userId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
            ], 403);
        }

        $message = $this->chatService->sendMessage($conversation, $request->input('content'));

        return response()->json([
            'status' => 'success',
            'message' => $message,
        ], 201);
    }

    /**
     * Get user's conversations (both as buyer and seller).
     */
    public function getUserConversations()
    {
        $conversations = $this->chatService->getUserConversations();

        return response()->json([
            'status' => 'success',
            'conversations' => $conversations,
        ]);
    }

    /**
     * Mark messages as read.
     */
    public function markAsRead(Conversation $conversation)
    {
        $userId = Auth::id();

        if ($conversation->buyer_id !== $userId && $conversation->seller_id !== $userId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
            ], 403);
        }

        $this->chatService->markAsRead($conversation);

        return response()->json([
            'status' => 'success',
            'message' => 'Messages marked as read',
        ]);
    }
}
