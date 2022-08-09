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
if (password_verify($userPwd, $row['pwd']) && in_array($gameId, json_decode($row['games'], true))) {
	$sql = "SELECT name, letterBag, players, turn, inactive, board, chat FROM games WHERE id='$gameId'";
	$query = mysqli_query($conn, $sql);
	$row = mysqli_fetch_assoc($query);

	// remove the letter bank from all players other than the current user - no cheating!
	$players = json_decode($row['players'], true);
	for ($i=0; $i < count($players); $i++) { 
		if ($players[$i]['id'] != $user) {
			unset($players[$i]['letterBank']);
		}
	}

	// find the names of users who send chat messages
	$chatSenderBuffer = Array();
	$chat = json_decode($row['chat'], true);
	for ($i=0; $i < count($chat); $i++) { 
		$senderId = $chat[$i]['sender'];
		$senderName = '';
		if (!$senderName = $chatSenderBuffer[$senderId]) {
			$sql = "SELECT name FROM accounts WHERE id='$senderId'";
			$query = mysqli_query($conn, $sql);
			if ($query) {
				$row = mysqli_fetch_assoc($query);
				$senderName = $row['name'];
				$chatSenderBuffer[$senderId] = $senderName;
			}
		}
		$chat[$i]['senderName'] = $senderName;
	}

	// put it all together
	$obj = Array(
		"id" => $gameId,
		"name"=> $row['name'],
		"players" => $players,
		"turn" => (int)$row['turn'],
		"inactive" => ((int)$row['inactive'] === 1 ? true : false),
		"board" => json_decode($row['board'], true),
		"chat" => $chat
	);
	echo json_encode($obj);
} else {
	echo "0";
}

// close the connection
$conn->close();

?>