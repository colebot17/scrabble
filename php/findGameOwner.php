<?php
// this file takes in a game id and a list of players with the minimum format of:
// [{"name": "test", "pwd": "12345678"}, ...]
//
// it returns the index in the list of the player who owns the specified game

// define connection
$servername = "173.201.180.187";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$accounts = json_decode($_POST['accounts'], true);
$gameId = $_POST['gameId'];

require "verifyPassword.php";

// loop through each specified account and see which one(s) own the game
$owners = Array();
for ($i = 0; $i < count($accounts); $i++) {
    $name = $accounts[$i]["name"];
    $sql = "SELECT id, games FROM accounts WHERE name='$name'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    if (!$row) continue;
    $games = json_decode($row['games'], true);
    if (verifyPassword($conn, $row['id'], $accounts[$i]["pwd"])) {
        if (in_array($gameId, $games)) {
            $owners[] = Array("index" => $i, "id" => (int)$row['id']);
        }
    }
}

// if we collected no owners in the earlier loop,
if (count($owners) === 0) {
    // then none of these players own the game
    $res = Array(
        "errorLevel" => 1,
        "message" => "The owner of the game is not in the list",
        "data" => null
    );
    exit(json_encode($res));
}

// if there are multiple owners, figure out which one to use based on the game turn (and then order)
$owner = $owners[0]["index"]; // use the first one by default in case we cannot find a preferable owner
if (count($owners) > 1) {
    $sql = "SELECT turn, players FROM games WHERE id='$gameId'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    $players = json_decode($row['players'], true);
    $totalTurn = $row['turn'];
    $turn = $totalTurn % count($players);

    // if it is any owner's turn, use that owner
    for ($i = 0; $i < count($owners); $i++) {
        if ($players[$turn]["id"] == $owners[$i]["id"]) {
            $owner = $owners[$i]["index"];
            break;
        }
    }
}

// now that we have narrowed it down, we can return the response
$ownerName = $accounts[$owner]["name"];
$res = Array(
    "errorLevel" => 0,
    "message" => "$ownerName owns the game (index $owner in list)",
    "data" => $owner
);
echo json_encode($res);

mysqli_close($conn);