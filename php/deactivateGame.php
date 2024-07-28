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
    $sql = "SELECT players FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    $players = json_decode($row['players'], true);

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