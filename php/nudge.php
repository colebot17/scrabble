<?php

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

// get data from POST
$user = (int)$_POST['user'];
$pwd = $_POST['pwd'];
$gameId = (int)$_POST['gameId'];

// check password
require "verifyPassword.php";
if (!verifyPassword($conn, $user, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// make sure that the current player has a notification method
$sql = "SELECT players, turn, name FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if (!$row) exit('{"errorLevel":2,"message":"Invalid Game Id"}');
$players = json_decode($row['players'], true);
$totalTurn = $row['turn'];
$turn = $totalTurn % count($players);
$gameName = $row['name'];

$currentPlayerId = $players[$turn]['id'];
$sql = "SELECT notificationMethods FROM accounts WHERE id='$currentPlayerId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$methods = json_decode($row['notificationMethods'], true);

// prevent self-nudging
if ($user == $currentPlayerId) {
    exit('{"errorLevel":1,"message":"You cannot nudge yourself"}');
}

// make sure the user has a way to be notified
$hasEnabledMethods = false;
for ($i = 0; $i < count($methods); $i++) {
    if (!$methods[$i]["disabled"]) {
        $hasEnabledMethods = true;
        break;
    }
}
if (!$hasEnabledMethods) {
    exit('{"errorLevel":1,"message":"This player cannot be nudged"}');
}

// gather information for notification
$un = "";
$playerList = Array();
for ($i = 0; $i < count($players); $i++) {
	$pid = $players[$i]['id'];
	$sql = "SELECT name FROM accounts WHERE id='$pid'";
	$query = mysqli_query($conn, $sql);
	$row = mysqli_fetch_assoc($query);
	$playerList[] = $row['name'];
	if ($pid == $user) $un = $row['name'];
}


// send a nudge notification to the player
require "notifications/notify.php";
require "notifications/templates/nudgeEmail.php";

[$emailSubject, $emailBody] = nudgeEmail($un, $gameName, $gameId, $playerList);
notifyByEmail($conn, $currentPlayerId, $emailSubject, $emailBody);

mysqli_close($conn);

echo json_encode(Array(
    "errorLevel" => 0,
    "message" => "You nudged $playerList[$turn] to make their move"
));