<?php

function updateChatRead($conn, int $gameId, int $userId) {
    // get the chat and players
    $sql = "SELECT chat, players FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    if (!$query) return false;
    $row = mysqli_fetch_assoc($query);
    $chat = json_decode($row['chat'], true);
    $players = json_decode($row['players'], true);

    // determine the latest message id
    $latestMessageId = count($chat) - 1;

    // set the user's read marker
    for ($i = 0; $i < count($players); $i++) {
        if ($players[$i]['id'] == $userId) {
            $players[$i]['chatRead'] = $latestMessageId;
            break;
        }
    }

    // encode and escape the player list (for the usernames)
    $playersJson = json_encode($players);
    $playersJson = str_replace("'", "\'", $playersJson);
    $playersJson = str_replace('"', '\"', $playersJson);

    // re-upload the player list
    $sql = "UPDATE games SET players='$playersJson' WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    if (!$query) return false;

    return true;
}