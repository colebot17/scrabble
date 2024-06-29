<?php

function canNudge($conn, $user, $gameId) {
    // determine if the nudge button should be enabled

    // requirements: 
    //    must not be current player's turn
    //    current turn player must have enabled notification methods
    //
    //    last move must have been at least 24 hours ago
    //    last nudge must have been at least 24 hours ago

    //// GATHER INFO

    // get information about the game
    $sql = "SELECT players, turn, updates FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    $players = json_decode($row['players'], true);
    $totalTurn = (int)$row['turn'];
    $turn = $totalTurn % count($players);
    $currentTurnPlayerId = $players[$turn]["id"];
    $updates = json_decode($row['updates'], true);

    // get information about the current turn player
    $sql = "SELECT notificationMethods FROM accounts WHERE row='$currentTurnPlayerId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    $methods = json_decode($row['notificationMethods'], true);


    //// VALIDATE

    // make sure it is not the current player's turn
    if ($players[$turn]['id'] == $user) {
        return Array(false, "You cannot nudge yourself");
    }

    // make sure the user has at least one enabled notification method
    $hasEnabledMethods = false;
    for ($i = 0; $i < count($methods); $i++) {
        if (!$methods[$i]["disabled"]) {
            $hasEnabledMethods = true;
            break;
        }
    }
    if (!$hasEnabledMethods) {
        return Array(false, "This user cannot be nudged");
    }

    // make sure the last move and nudge was at least 24 hours ago
    $compareEpoch = time() - (24 * 60 * 60);
    for ($i = count($updates) - 1; $i >= 0; $i--) {
        // stop (and pass check) if the update happened before the compare time
        if ($updates[$i]["timestamp"] < $compareEpoch) {
            break;
        }

        // stop (and fail check) if the update is a move update
        if ($updates[$i]["type"] === "move") {
            return Array(false, "You can only nudge a player if they haven't moved for 24 hours");
        }

        // stop (and fail check) if the update is a nudge update
        if ($updates[$i]["type"] === "nudge") {
            return Array(false, "You can only nudge a player once every 24 hours");
        }
    }

    return Array(true);
}