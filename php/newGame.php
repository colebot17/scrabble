<?php

// define connection
$servername = "173.201.180.187";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$playerList = json_decode($_POST['players'], true);

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// check password
require "verifyPassword.php";
if (!verifyPassword($conn, $user, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// generate a game
$letterBag = array("A" => 9, "B" => 2, "C" => 2, "D" => 4, "E" => 12, "F" => 2, "G" => 3, "H" => 2, "I" => 9, "J" => 1, "K" => 1, "L" => 4, "M" => 2, "N" => 6, "O" => 8, "P" => 2, "Q" => 1, "R" => 6, "S" => 4, "T" => 6, "U" => 4, "V" => 2, "W" => 2, "X" => 1, "Y" => 2, "Z" => 1, "" => 2);

// generate the player list for the game
$numPlayers = count($playerList);
$players = array();
for ($i = 0; $i < $numPlayers; $i++) { 
	array_push($players, array(
		"id" => $playerList[$i],
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

// add the game
$sql = "INSERT INTO games(letterBag, players, turn, inactive, board, words, creationDate, chat, updates) VALUES ('$letterBagJson', '$playersJson', 0, 0, '$boardJson', '[]', '$datestamp', '[]', '[]');";
$query = mysqli_query($conn, $sql);

// get the id of the game
$sql = "SELECT id FROM games ORDER BY id DESC LIMIT 1;";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$gameId = $row['id'];

// add the game to player accounts
for ($i = 0; $i < $numPlayers; $i++) { // for each player in the game
	$sql = "SELECT games FROM accounts WHERE id='$playerList[$i]'"; // get the game list of that player
	$query = mysqli_query($conn, $sql);
	$row = mysqli_fetch_assoc($query);
	$userGames = json_decode($row['games'], true);

	array_push($userGames, $gameId); // add the new game to it

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

// close the connection
$conn->close();

?>