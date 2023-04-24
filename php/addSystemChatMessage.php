<?php

function addSystemChatMessage($conn, $gameId, $action, $data) {
    // get the chat
    $sql = "SELECT chat FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    if (!$query) return false;
    $row = mysqli_fetch_assoc($query);
    $chat = json_decode($row['chat'], true);

    // generate the message
    $message = Array(
        "type" => "system",
        "action" => $action,
        "data" => $data,
        "timestamp" => date(DATE_ISO8601)
    );

    // add the message to the chat
    array_push($chat, $message);

    // encode and escape the chat
    $chatJson = json_encode($chat);
    $chatJson = str_replace("'", "\'", $chatJson);
    $chatJson = str_replace('"', '\"', $chatJson);

    // upload the chat
    $sql = "UPDATE games SET chat='$chatJson' WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    if ($query) {
        return true;
    } else {
        return false;
    }
}

?>