<?php

// class GameEndReason {
//     public $type;

//     public function __construct($type) {
//         $this->type = $type;
//     }
// }

// class RequestEndReason extends GameEndReason {
//     public $player;

//     public function __construct($player) {
//         parent::__construct("request");

//         $this->player = (int)$player;
//     }
// }

function deactivate($conn, $gameId, $user, $reason) {
    $sql = "SELECT players, name FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    $players = json_decode($row['players'], true);
    $gameName = $row["name"];

    // delete the game if no players have scored points
    $delete = true;
    for ($i = 0; $i < count($players); $i++) {
        if ($players[$i]["points"] > 0) {
            $delete = false;
            break;
        }
    }

    if ($delete) {
        completelyDelete($conn, $gameId);
        return "deleted";
    }

    // deactivate the game
    $sql = "UPDATE games SET inactive=1 WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);

    // set all the players' gameEndUnseen (except current player)
    for ($i = 0; $i < count($players); $i++) {
        $players[$i]["gameEndUnseen"] = (int)$players[$i]["id"] !== $user;
    }
    $playersJson = json_encode($players);
    $sql = "UPDATE games set players='$playersJson' WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);

    // set the endDate
    $datestamp = date("Y-m-d");
    $sql = "UPDATE games SET endDate='$datestamp' WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);

    // add the update
    require_once __DIR__ . "/addUpdate.php";
    $updateData = Array(
        "reason" => $reason
    );
    addUpdate($conn, $gameId, "gameEnd", $updateData);

    // find the winner(s) and create a winner string
    $maxPoints = 0;
    for ($i = 0; $i < count($players); $i++) {
        if ($players[$i]["points"] > $maxPoints) {
            $maxPoints = $players[$i]["points"];
        }
    }
    $winnerNames = Array();
    for ($i = 0; $i < count($players); $i++) {
        if ($players[$i]["points"] === $maxPoints) {
            $pid = $players[$i]["id"];
            $sql = "SELECT name FROM accounts WHERE id='$pid'";
            $query = mysqli_query($conn, $sql);
            $row = mysqli_fetch_assoc($query);
            $winnerNames[] = $row["name"];
        }
    }
    switch (count($winnerNames)) {
        case 0:
            $winnerString = "[nobody]";
        case 1:
            $winnerString = $winnerNames[0];
        case 2:
            $winnerString = $winnerNames[0] . " and " . $winnerNames[1];
        default:
            $winnerString = "";
            for ($i = 0; $i < count($winnerNames); $i++) {
                $winnerString .= $winnerNames[$i];
                if ($i === count($winnerNames) - 2) {
                    $winnerString .= ", ";
                } else if ($i !== count($winnerNames) - 1) {
                    $winnerString .= ", and ";
                }
            }
    }

    $playerNames = Array();
    for ($i = 0; $i < count($players); $i++) {
		$pid = $players[$i]["id"];
		$sql = "SELECT name FROM accounts WHERE id='$pid'";
		$query = mysqli_query($conn, $sql);
		$row = mysqli_fetch_assoc($query);
        $playerNames[] = $row["name"];
    }

    // notify all players except the current player
    require_once "notifications/notify.php";
    for ($i = 0; $i < count($players); $i++) {
        if ($players[$i]["id"] === $user) continue;
        notify($conn, $players[$i]["id"], "gameEnd", Array($winnerString, $gameName, $gameId, $playerNames));
    }

    return "deactivated";
}

function completelyDelete($conn, $gameId) {
    $sql = "SELECT players FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    $players = json_decode($row['players'], true);

    // remove the game from each of the players
    for ($i = 0; $i < count($players); $i++) {
        $pid = $players[$i]["id"];
        $sql = "SELECT games FROM accounts WHERE id='$pid'";
        $query = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($query);

        $list = json_decode($row['games'], true);

        if (($key = array_search($gameId, $list)) !== false) {
            unset($list[$key]);
        }
        $list = array_values($list);

        $listJson = json_encode($list);

        $sql = "UPDATE accounts SET games='$listJson' WHERE id='$pid'";
        $query = mysqli_query($conn, $sql);
    }

    // perform the deletion
    $sql = "DELETE FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
}