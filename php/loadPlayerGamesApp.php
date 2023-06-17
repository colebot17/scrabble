<?php

// define connection
$servername = "p3nlmysql21plsk.secureserver.net:3306";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$user = $_POST['user'];
$userPwd = $_POST['pwd'];

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// get the data we need
$sql = "SELECT pwd, games FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);

// make sure the user exists
if (!$row) {
	exit('{"errorLevel":2,"message":"This user does not exist!"}');
}

// check for the correct password
if (!password_verify($userPwd, $row['pwd'])) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

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
		"id" => $row['id'],
		"name" => $row['name'],
		"turn" => $row['turn'],
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
			"id" => $playerId,
			"name" => $row['name'],
			"points" => $players[$j]["points"],
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

// return the encoded games object
echo '{"errorLevel":0,"data":' . json_encode($fullGamesList) . '}';

// close the connection
$conn->close();

?>