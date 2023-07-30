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
        $sql = "SELECT name, turn, inactive, players, lastUpdate, endDate FROM games WHERE id='$gameId'";
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

        // get the end date of the game (or null if it hasn't ended yet)
        $endDate = $row['endDate'];
        if ($endDate === '0000-00-00') $endDate = null;

        $game = Array(
            "id" => (int)$games[$i],
            "name" => $row['name'],
            "turn" => (int)$row['turn'],
            "inactive" => $inactive,
            "newlyInactive" => false,
            "players" => Array(),
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
                "endGameRequest" => $player['endGameRequest']
            );

            $game['players'][] = $playerObj;

            // if the game has ended and hasn't been seen by the current player
            if ($inactive && $playerId === (int)$userId && $player['gameEndUnseen']) {
                // send this back with the game
                $game['newlyInactive'] = true;

                // set the game end as seen and upload it
                $players[$j]['gameEndUnseen'] = false;
                $playersJson = json_encode($players);
                $sql = "UPDATE games SET players='$playersJson' WHERE id='$gameId'";
                $query = mysqli_query($conn, $sql);
            }
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

?>