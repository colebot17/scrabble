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
$game = $_POST['game'];

// check password
$sql = "SELECT pwd FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if (!password_verify($pwd, $row['pwd'])) {
	exit('{"errorLevel":2,"message":"Invalid Session!"}');
}

// get the player list from the server
$sql = "SELECT players FROM games WHERE id='$game'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);

// set the endGameRequest property for the current user
$players = json_decode($row['players'], true);
$playerList = Array();
for ($i=0; $i < count($players); $i++) { 
	array_push($playerList, $players[$i]['id']);
}
$players[array_search($user, $playerList)]['endGameRequest'] = "true";

// check whether all players have the endGameRequest property
$endGame = true;
for ($i=0; $i < count($players); $i++) { 
	if ($players[$i]['endGameRequest'] !== "true") {
		$endGame = false;
		break;
	}
}

if ($endGame) {
	// if no players have scored any points yet, completely delete the game
	$deleteGame = true;
	for ($i=0; $i < count($players); $i++) { 
		if ($players[$i]['points'] > 0) {
			$deleteGame = false;
			break;
		}
	}

	if ($deleteGame) {
		// remove the game from all players
		for ($i=0; $i < count($playerList); $i++) { 
			$sql = "SELECT games FROM accounts WHERE id='$playerList[$i]'";
			$query = mysqli_query($conn, $sql);
			$row = mysqli_fetch_assoc($query);

			$playerGames = json_decode($row['games'], true);
			if (($key = array_search($game, $playerGames)) !== false) {
				unset($playerGames[$key]);
			}
			$playerGames = json_encode(array_values($playerGames));

			$sql = "UPDATE accounts SET games='$playerGames' WHERE id='$playerList[$i]'";
			$query = mysqli_query($conn, $sql);
		}

		// delete the game
		$sql = "DELETE FROM games WHERE id='$game'";
		$query = mysqli_query($conn, $sql);
	} else { // if players have already scored points
		// deactivate the game
		$sql = "UPDATE games SET inactive=1 WHERE id='$game'";
		$query = mysqli_query($conn, $sql);

		// set the endDate
		$datestamp = date("Y-m-d");
		$sql = "UPDATE games SET endDate='$datestamp' WHERE id='$game'";
		$query = mysqli_query($conn, $sql);
	}
}

// reupload the player list to the server
$playersJson = json_encode($players);
$sql = "UPDATE games SET players='$playersJson' WHERE id='$game'";
$query = mysqli_query($conn, $sql);

echo '{"errorLevel":0,"message":"' . ($endGame ? 'The game has ended.' : 'You have voted to end the game.') . '"}';

// close the connection
$conn->close();

?>