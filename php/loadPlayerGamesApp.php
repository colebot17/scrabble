<?php

// get data from GET/POST
$name = $_POST['name'];
$userPwd = $_POST['pwd'];

require_once(__DIR__ . "/util/getConn.php");
$conn = getConn();

// get the data we need
$sql = "SELECT id, pwd, games FROM accounts WHERE name='$name'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);

// make sure the user exists
if (!$row) {
	exit('{"errorLevel":2,"message":"This user does not exist!"}');
}

// check for the correct password
require "verifyPassword.php";
password_verify($userPwd, $row['pwd']);

$user = $row['id'];

// parse the games
$games = json_decode($row['games'], true);
$gameRemoved = false;
$fullGamesList = Array();

// for each game, get the names of the players, the current turn, whether it is inactive, and the last move timestamp
for ($i = 0; $i < count($games); $i++) {
	$sql = "SELECT id, name, turn, inactive, players, lastUpdate, endDate FROM games WHERE id='$games[$i]'";
	$query = mysqli_query($conn, $sql);
	$row = mysqli_fetch_assoc($query);

	// if the game cannot be found
	if (!$row) {
		// remove it from the list (we will upload this later)
		unset($games[$i]);
		$gameRemoved = true;
		continue;
	}

	$players = json_decode($row['players'], true);

	$endDate = $row['endDate'];
	if ($endDate === '0000-00-00') {
		$endDate = null;
	}

	$fullGamesList[$i] = Array(
		"id" => (int)$row['id'],
		"name" => $row['name'],
		"turn" => (int)$row['turn'],
		"inactive" => ((int)$row['inactive'] === 1 ? true : false),
		"players" => Array(),
		"lastUpdate" => $row['lastUpdate'],
		"endDate" => $endDate
	);

	// for each player, add their name, id, points, and request status into the new game array
	for ($j = 0; $j < count($players); $j++) {
		$playerId = $players[$j]['id'];

		$sql = "SELECT name FROM accounts WHERE id='$playerId'";
		$query = mysqli_query($conn, $sql);
		$row = mysqli_fetch_assoc($query);

		$fullGamesList[$i]["players"][$j] = Array(
			"id" => (int)$playerId,
			"name" => $row['name'],
			"points" => (int)$players[$j]["points"],
			"endGameRequest" => $players[$j]["endGameRequest"]
		);
	}

	// make sure the players array is not associative
	$fullGamesList[$i]["players"] = array_values($fullGamesList[$i]["players"]);
}

// make sure the games array is not associative
$fullGamesList = array_values($fullGamesList);

// if any game has been removed, upload the new games list
if ($gameRemoved) {
	$games = array_values($games);
	$gamesJson = json_encode($games);
	$sql = "UPDATE accounts SET games='$gamesJson' WHERE id='$user'";
	$query = mysqli_query($conn, $sql);
}

// get the friends
include "friends/getFriends.php";
$friendLists = getAllLists($conn, $user);

// return the encoded games object
$res = Array(
	"errorLevel" => 0,
	"data" => $fullGamesList,
	"friends" => $friendLists,
	"userId" => (int)$user
);
echo json_encode($res);

// close the connection
$conn->close();

?>