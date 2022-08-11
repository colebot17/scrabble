<?php

// define connection
$servername = "p3nlmysql21plsk.secureserver.net:3306";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$name = $_POST['name'];
$pwd = $_POST['pwd'];

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// check password
$sql = "SELECT pwd FROM accounts WHERE name='$name'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if (!password_verify($pwd, $row['pwd'])) {
	exit('{"errorLevel":1,"message":"Incorrect username or password."}');
}

$obj = Array();

$sql = "SELECT id, name, pwd, games FROM accounts WHERE name='$name'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);

$obj['id'] = $row['id'];
$obj['name'] = $row['name'];
$obj['pwd'] = $row['pwd'];

// parse the games
$games = json_decode($row['games'], true);
$newGames = Array();

// for each game, get the names of the players, the current turn, whether it is inactive, and the last move timestamp
for ($i = 0; $i < count($games); $i++) {
	$sql = "SELECT name, turn, inactive, players, lastMove FROM games WHERE id='$games[$i]'";
	$query = mysqli_query($conn, $sql);
	$row = mysqli_fetch_assoc($query);
	$players = json_decode($row['players'], true);

	$newGames[$games[$i]] = Array(
		"name" => $row['name'],
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

$obj['games'] = json_encode($newGames);


$returnArr = Array(
	"errorLevel" => 0,
	"message" => "Sign-in successful.",
	"data" => $obj
);

echo json_encode($returnArr);

// close the connection
$conn->close();

?>