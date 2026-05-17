<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});


Broadcast::channel('conversation.{id}', function ($user, $id) {
    $conversation = \App\Models\Conversation::find($id);
    if (!$conversation) return false;
    return (int) $user->id === (int) $conversation->buyer_id || (int) $user->id === (int) $conversation->seller_id;
});