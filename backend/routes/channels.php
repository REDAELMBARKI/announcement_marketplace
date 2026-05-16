<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});


Broadcast::channel('coversation.{id}' , function($user , $id){
     return $user->conversations()->where('conversation_id' , $id)->exists();
});