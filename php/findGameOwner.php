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

for ($i = 0; $i < count($accounts); $i++) {
    $name = $accounts[$i]["name"];
    $sql = "SELECT id, games FROM accounts WHERE name='$name'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    if (!$row) continue;
    $games = json_decode($row['games'], true);
    if (verifyPassword($conn, $row['id'], $accounts[$i]["pwd"])) {
        if (in_array($gameId, $games)) {
            $res = Array(
                "errorLevel" => 0,
                "message" => "$name owns the game (index $i in list)",
                "data" => $i
            );
            echo json_encode($res);
            exit();
        }
    }
}

$res = Array(
    "errorLevel" => 1,
    "message" => "The owner of the game is not in the list",
    "data" => null
);
echo json_encode($res);

mysqli_close($conn);