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
	$sql = "SELECT name, letterBag, players, turn, inactive, board, creationDate, endDate, chat FROM games WHERE id='$gameId'";
	$query = mysqli_query($conn, $sql);
	$row = mysqli_fetch_assoc($query);

	$name = $row['name'];
	$letterBag = json_decode($row['letterBag'], true);
	$turn = (int)$row['turn'];
	$inactive = ((int)$row['inactive'] === 1 ? true : false);
	$board = json_decode($row['board'], true);
	$creationDate = $row['creationDate'];
	$endDate = $row['endDate'];

	// remove the letter bank from all players other than the current user - no cheating!
	$players = json_decode($row['players'], true);
	for ($i=0; $i < count($players); $i++) { 
		if ($players[$i]['id'] != $user) {
			unset($players[$i]['letterBank']);
			unset($players[$i]['bankOrder']);
		}
	}

	// get the number of letters left in the letter bag
	$lettersLeft = 0;
	for ($i=0; $i < count(array_values($letterBag)); $i++) {
		$lettersLeft += array_values($letterBag)[$i];
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
		"id"           => (int)$gameId,
		"name"         => $name,
		"lettersLeft"  => (int)$lettersLeft,
		"players"      => $players,
		"turn"         => (int)$turn,
		"inactive"     => $inactive,
		"board"        => $board,
		"creationDate" => $creationDate,
		"endDate"      => ($inactive ? $endDate : null),
		"chat"         => $chat
	);
	echo json_encode($obj);
} else {
	echo "0";
}

// close the connection
$conn->close();

?>