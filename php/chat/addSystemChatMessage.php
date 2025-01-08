<?php

function addSystemChatMessage($conn, int $gameId, string $action, array $data) {
    // generate the message
    $message = Array(
        "type" => "system",
        "action" => $action,
        "data" => $data,
        "timestamp" => date(DATE_ISO8601)
    );

    require "addChatMessage.php";
    $messageAdded = addChatMessage($conn, $gameId, $message);

    if (!$messageAdded) return false;

    return true;
}