<?php

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
$gameId = (int)$_POST['game'];

// check password
require "verifyPassword.php";
if (!verifyPassword($conn, $user, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// get the player list from the server
$sql = "SELECT players FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);

// set the endGameRequest property for the current user
$players = json_decode($row['players'], true);
$playerList = Array();
for ($i=0; $i < count($players); $i++) { 
	array_push($playerList, $players[$i]['id']);
}
$players[array_search($user, $playerList)]['endGameRequest'] = true;

// reupload the player list to the server
$playersJson = json_encode($players);
$sql = "UPDATE games SET players='$playersJson' WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);

// check whether all players have the endGameRequest property
$endGame = true;
for ($i=0; $i < count($players); $i++) { 
	if (!$players[$i]['endGameRequest']) {
		$endGame = false;
		break;
	}
}

$deleted = false;

if ($endGame) {
	require "deactivateGame.php";
	$deleted = deactivate($conn, $gameId, $user, "end") === "deleted";
}

if (!$deleted) {
	// calculate the winning player(s)
	$highestScore = 0;
	for ($i = 0; $i < count($players); $i++) {
		if ($players[$i]["points"] > $highestScore) {
			$highestScore = $players[$i]["points"];
		}
	}
	$winnerIndicies = Array();
	for ($i = 0; $i < count($players); $i++) {
		if ($players[$i]["points"] === $highestScore) {
			$winnerIndicies[] = $i;
		}
	}

	// notify the other players
	$playerNames = Array();
	$un = "<unknown player>";
	for ($i = 0; $i < count($players); $i++) {
		$pid = $players[$i]["id"];
		$sql = "SELECT name FROM accounts WHERE id='$pid'";
		$query = mysqli_query($conn, $sql);
		$row = mysqli_fetch_assoc($query);

		$playerNames[] = $row['name'];
		if ($pid == $user) $un = $row['name'];
	}

	$sql = "SELECT name FROM games WHERE id='$gameId'";
	$query = mysqli_query($conn, $sql);
	$row = mysqli_fetch_assoc($query);
	$gameName = $row['name'];

	require_once "notifications/notify.php";
	for ($i = 0; $i < count($players); $i++) {
		if ($players[$i]["id"] == $user) continue;

		notify($conn, $players[$i]["id"], "endGame", Array($un, $gameName, $gameId, $playerNames));
	}
}

$res = Array(
	"errorLevel" => 0,
	"message" => ($endGame ? "The game has ended." : "You have voted to end the game."),
	"data" => Array(
		"gameEnded" => $endGame,
		"gameDeleted" => $deleted,
		"winnerIndicies" => $winnerIndicies || []
	)
);

echo json_encode($res);

if ($deleted) exit();

//////////
// add to updates list
//////////

// generate the data
$updateData = Array(
	"player" => $user,
	"playerIndex" => array_search($user, $playerList)
);

require "addUpdate.php";
addUpdate($conn, $gameId, "gameEndVote", $updateData);

if ($endGame) {
	$updateData = Array(
		"player" => $user,
		"playerIndex" => array_search($user, $playerList),
		"reason" => "vote",
		"gameDeleted" => false,
		"winnerIndicies" => $winnerIndicies
	);
	addUpdate($conn, $gameId, "gameEnd", $updateData);
}

// add system message to chat
require "chat/addSystemChatMessage.php";
$data = Array(
	"playerId" => $user
);
addSystemChatMessage($conn, $gameId, "gameEndVote", $data);

// close the connection
$conn->close();

?>