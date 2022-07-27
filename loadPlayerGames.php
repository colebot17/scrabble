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
$newGames = Array();

// for each game, get the names of the players, the current turn, whether it is inactive, and the last move timestamp
for ($i = 0; $i < count($games); $i++) {
	$sql = "SELECT turn, inactive, players, lastMove FROM games WHERE id='$games[$i]'";
	$query = mysqli_query($conn, $sql);
	$row = mysqli_fetch_assoc($query);
	$players = json_decode($row['players'], true);

	$newGames[$games[$i]] = Array(
		"turn" => $row['turn'],
		"inactive" => ((int)$row['inactive'] === 1 ? true : false),
		"players" => Array(),
		"lastMove" => $row['lastMove']
	);

	// for each player, add their name, id, and points into the new game array
	for ($j = 0; $j < count($players); $j++) {
		$playerId = $players[$j]['id'];

		$sql = "SELECT name FROM accounts WHERE id='$playerId'";
		$query = mysqli_query($conn, $sql);
		$row = mysqli_fetch_assoc($query);

		$newGames[$games[$i]]["players"][$j] = Array("id" => $playerId, "name" => $row['name'], "points" => $players[$j]["points"]);
	}

	// make sure the players array is not associative
	$newGames[$games[$i]]["players"] = array_values($newGames[$games[$i]]["players"]);
}

// return the encoded games object
echo '{"errorLevel":0,"data":' . json_encode($newGames) . '}';

// close the connection
$conn->close();

?>