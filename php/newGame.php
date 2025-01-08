<?php

// get data from GET/POST
$user = (int)$_POST['user'];
$pwd = $_POST['pwd'];
$playerList = json_decode($_POST['players'], true);
$lang = $_POST['lang'];

require_once(__DIR__ . "/util/getConn.php");
$conn = getConn();

// check password
require "verifyPassword.php";
if (!verifyPassword($conn, $user, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// generate a game
$letterBag = json_decode(file_get_contents('../resources/languages.json'), true)[$lang]["letterDistribution"];

// generate the player list for the game
$numPlayers = count($playerList);
$players = array();
for ($i = 0; $i < $numPlayers; $i++) { 
	array_push($players, array(
		"id" => (int)$playerList[$i],
		"letterBank" => array(),
		"bankOrder" => array(0, 1, 2, 3, 4, 5, 6),
		"points" => 0,
		"endGameRequest" => false,
		"chatRead" => 0
	));
}

// pick letters for all players
for ($i = 0; $i < 7; $i++) { // for each letter that needs to be drawn
	$shuffledPlayers = range(0, $numPlayers - 1);
	shuffle($shuffledPlayers);
	for ($j = 0; $j < $numPlayers; $j++) { // for each player (in a random order)
		// generate a long form of the letter bag
		$longBag = array();
		for ($k = 0; $k < count($letterBag); $k++) { 
			for ($l = 0; $l < array_values($letterBag)[$k]; $l++) { 
				array_push($longBag, array_keys($letterBag)[$k]);
			}
		}

		// pick a random letter from the long bag
		$rand = random_int(0, count($longBag) - 1);
		$newLetter = $longBag[$rand];

		array_splice($longBag, $rand, 1); // remove the letter from the long bag
		$letterBag[$newLetter]--; // remove the letter from the short bag

		array_push($players[$shuffledPlayers[$j]]["letterBank"], $newLetter); // add the letter to the player bank
	}
}

$board = array();
for ($i = 0; $i < 15; $i++) { 
	array_push($board, [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]);
}

$letterBagJson = json_encode($letterBag);
$playersJson = json_encode($players);
$boardJson = json_encode($board);

// get the datestamp
$datestamp = date("Y-m-d");

// create an update for the game creation
$update = Array(
	"type" => "creation",
	"data" => Array(
		"player" => $user
	),
	"timestamp" => time()
);
$updates = Array($update);
$updatesJson = json_encode($updates);

// add the game
$sql = "INSERT INTO games(lang, letterBag, players, board, creationDate, updates) VALUES ('$lang', '$letterBagJson', '$playersJson', '$boardJson', '$datestamp', '$updatesJson');";
$query = mysqli_query($conn, $sql);

// get the id of the game
$sql = "SELECT id FROM games ORDER BY id DESC LIMIT 1;";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$gameId = (int)$row['id'];

// add the game to player accounts
for ($i = 0; $i < $numPlayers; $i++) { // for each player in the game
	$sql = "SELECT games FROM accounts WHERE id='$playerList[$i]'"; // get the game list of that player
	$query = mysqli_query($conn, $sql);
	$row = mysqli_fetch_assoc($query);
	$userGames = json_decode($row['games'], true);

	$userGames[] = $gameId; // add the new game to it

	$userGamesJson = json_encode($userGames); // encode and reupload the game list of the player
	$sql = "UPDATE accounts SET games='$userGamesJson' WHERE id='$playerList[$i]'";
	$query = mysqli_query($conn, $sql);
}

$res = Array(
	"errorLevel" => 0,
	"message" => "Game Created.",
	"data" => $gameId
);
echo json_encode($res);


// send notifications

$playerNames = Array();
for ($i = 0; $i < count($players); $i++) {
	$pid = $players[$i]["id"];
	$sql = "SELECT name FROM accounts WHERE id='$pid'";
	$query = mysqli_query($conn, $sql);
	$row = mysqli_fetch_assoc($query);
	$playerNames[] = $row['name'];
}

require "notifications/notify.php";

for ($i = 0; $i < count($players); $i++) {
	if ($players[$i]["id"] == $user) continue; // don't notify the one who created the game

	notify($conn, $players[$i]["id"], "newGame", Array("", $gameId, $playerNames));
}

// close the connection
$conn->close();