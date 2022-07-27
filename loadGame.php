<?php

// define connection
$servername = "p3nlmysql21plsk.secureserver.net:3306";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$user = $_POST['user'];
$userPwd = $_POST['pwd'];
$gameId = $_POST['game'];

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// check password and if game belongs to user
$sql = "SELECT pwd, games FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if (!password_verify($pwd, $row['pwd']) && in_array($gameId, json_decode($row['games'], true))) {
	$sql = "SELECT letterBag, players, turn, inactive, board FROM games WHERE id='$gameId'";
	$query = mysqli_query($conn, $sql);
	$row = mysqli_fetch_assoc($query);

	// remove the letter bank from all players other than the current user - no cheating!
	$players = json_decode($row['players'], true);
	for ($i=0; $i < count($players); $i++) { 
		if ($players[$i]['id'] != $user) {
			unset($players[$i]['letterBank']);
		}
	}

	// put it all together
	$obj = Array(
		"id" => $gameId,
		"letterBag" => json_decode($row['letterBag'], true),
		"players" => $players,
		"turn" => (int)$row['turn'],
		"inactive" => ((int)$row['inactive'] === 1 ? true : false),
		"board" => json_decode($row['board'], true)
	);
	echo json_encode($obj);
} else {
	echo "0";
}

// close the connection
$conn->close();

?>