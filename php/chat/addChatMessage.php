<?php

function addChatMessage($conn, int $gameId, array $message) {
    // get the chat
    $sql = "SELECT chat FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    if (!$query) return false;
    $row = mysqli_fetch_assoc($query);
    $chat = json_decode($row['chat'], true);

    // add the message to the chat
    $chat[] = $message;

    // encode and escape the chat
    $chatJson = json_encode($chat);
    $chatJson = str_replace("'", "\'", $chatJson);
    $chatJson = str_replace('"', '\"', $chatJson);

    // re-upload the chat
    $sql = "UPDATE games SET chat='$chatJson' WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);


    //////////
    // add to updates list
    //////////

    // generate the data
    $updateData = Array(
        "message" => $message
    );

    // get and add the sender name if sender exists
    if (array_key_exists('sender', $message) && $senderId = $message['sender']) {
        $sql = "SELECT name FROM accounts WHERE id='$senderId'";
        $query = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($query);
        $updateData['senderName'] = $row['name'];
    }

    require "../addUpdate.php";
    addUpdate($conn, $gameId, "chatMessageSend", $updateData);

    return true;
}