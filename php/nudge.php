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

// make sure the nudge is valid
require "canNudge.php";
$res = canNudge($conn, $user, $gameId);
if (!$res[0]) {
    exit('{"errorLevel":1,"message":"' . $res[1] . '"}');
}


// gather information for notification
$sql = "SELECT players, turn FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$players = json_decode($row['players'], true);
$totalTurn = (int)$row['turn'];
$turn = $totalTurn % count($players);

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


// send the nudge notification
require "notifications/notify.php";
require "notifications/templates/nudgeEmail.php";

[$emailSubject, $emailBody] = nudgeEmail($un, $gameName, $gameId, $playerList);
notifyByEmail($conn, $players[$turn]["id"], $emailSubject, $emailBody);

echo json_encode(Array(
    "errorLevel" => 0,
    "message" => "You nudged $playerList[$turn] to make their move"
));



// add a nudge update to the updates list

$updateData = Array(
    "nudgingPlayer" => $user,
    "nudgedPlayer" => $players[$turn]["id"]
);

require "addUpdate.php";
addUpdate($conn, $gameId, "nudge", $updateData);

mysqli_close($conn);