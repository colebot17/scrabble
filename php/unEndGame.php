<?php

$servername = "p3nlmysql21plsk.secureserver.net:3306";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// get data from POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$gameId = $_POST['game'];

// check password
$sql = "SELECT pwd FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if (!password_verify($pwd, $row['pwd'])) {
	exit('{"errorLevel":2,"message":"Invalid Session!"}');
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
$players[array_search($user, $playerList)]['endGameRequest'] = "false";

// reupload the player list to the server
$playersJson = json_encode($players);
$sql = "UPDATE games SET players='$playersJson' WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);

echo '{"errorLevel":0,"message":"Your vote to end the game has been revoked."}';

// add to update list
$sql = "SELECT updates FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$updates = json_decode($row['updates'], true);

array_push($updates, Array(
    "type" => "endGameVoteRevoke",
    "data" => Array(
        "player" => $user,
		"playerIndex" => array_search($user, $playerList)
	),
	"timestamp" => time()
));

$updatesJson = json_encode($updates);
$updatesJson = str_replace("'", "\'", $updatesJson);
$updatesJson = str_replace('"', '\"', $updatesJson);
$sql = "UPDATE games SET updates='$updatesJson' WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);

// close the connection
$conn->close();

?>