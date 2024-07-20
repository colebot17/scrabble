<?php

function getGamesList($conn, int $userId) {
    // get the data we need
    $sql = "SELECT pwd, games FROM accounts WHERE id='$userId'";
    $query = mysqli_query($conn, $sql);
    if (!$query) return false;
    $row = mysqli_fetch_assoc($query);
    $games = json_decode($row['games'], true);

    // define empty variables
    $anyGameRemoved = false;
    $fullGamesList = Array();

    // add each game object to the full games list
    for ($i = 0; $i < count($games); $i++) {
        $gameId = $games[$i];
        $sql = "SELECT name, lang, turn, inactive, players, chat, lastUpdate, endDate FROM games WHERE id='$gameId'";
        $query = mysqli_query($conn, $sql);
        if (!$query) return false;
        $row = mysqli_fetch_assoc($query);

        // if the game cannot be found
        if (!$row) {
            // remove it from the list (we will upload this later)
            unset($games[$i]);
            $anyGameRemoved = true;
            continue;
        }

        $inactive = (int)$row['inactive'] === 1 ? true : false;

        // get the players apart of the game
        $players = json_decode($row['players'], true);

        // get the chat
        $chat = json_decode($row['chat'], true);

        // get the end date of the game (or null if it hasn't ended yet)
        $endDate = $row['endDate'];
        if ($endDate === '0000-00-00') $endDate = null;

        $game = Array(
            "id" => (int)$games[$i],
            "name" => $row['name'],
            "lang" => $row['lang'],
            "turn" => (int)$row['turn'],
            "inactive" => $inactive,
            "players" => Array(),
            "chatUnread" => false,
            "lastUpdate" => $row['lastUpdate'],
            "endDate" => $endDate
        );

        // add each player object to the game
        for ($j = 0; $j < count($players); $j++) {
            $player = $players[$j];
            $playerId = (int)$player['id'];

            $sql = "SELECT name FROM accounts WHERE id='$playerId'";
            $query = mysqli_query($conn, $sql);
            if (!$query) return false;
            $row = mysqli_fetch_assoc($query);

            $playerObj = Array(
                "id" => $playerId,
                "name" => $row['name'],
                "points" => (int)$player['points'],
                "endGameRequest" => $player['endGameRequest'] ?? false
            );

            $game['players'][] = $playerObj;

            // if this is the current player
            if ($playerId === (int)$userId) {
                // if the game has ended and hasn't been seen
                if ($inactive && $player['gameEndUnseen'] ?? false) {
                    // send this back with the game
                    $game['newlyInactive'] = true;

                    // set the game end as seen and upload it
                    $players[$j]['gameEndUnseen'] = false;
                    $playersJson = json_encode($players);
                    $sql = "UPDATE games SET players='$playersJson' WHERE id='$gameId'";
                    $query = mysqli_query($conn, $sql);
                }

                // if there are unread chat messages
                if (count($chat) - 1 > (int)$player['chatRead']) {
                    // send this back with the game
                    $game['chatUnread'] = true;
                }
            }
        }

        if ($inactive) {
            $winningPoints = 0;
            for ($j = 0; $j < count($players); $j++) {
                if ($players[$j]['points'] > $winningPoints) {
                    $winningPoints = $players[$j]['points'];
                }
            }

            $winningPlayers = Array();
            for ($j = 0; $j < count($players); $j++) {
                if ($players[$j]['points'] === $winningPoints) {
                    $winningPlayers[] = $j;
                }
            }

            $game['winnerIndicies'] = $winningPlayers;
        }

        // add the new game to the full list
        $fullGamesList[] = $game;
    }

    // if any game has been removed, upload the new games list
    if ($anyGameRemoved) {
        $games = array_values($games);
        $gamesJson = json_encode($games);
        $sql = "UPDATE accounts SET games='$gamesJson' WHERE id='$userId'";
        $query = mysqli_query($conn, $sql);
    }

    return $fullGamesList;
}