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
$bankOrder = json_decode($_POST['bankOrder'], true);

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

$players = json_decode($row['players'], true);
$playerList = Array();
for ($i=0; $i < count($players); $i++) { 
	array_push($playerList, $players[$i]['id']);
}
$currentPlayerIndex = array_search($user, $playerList);

// make sure there aren't ghost tiles in the bank order
$bankCount = count($players[$currentPlayerIndex]['letterBank']);
for ($i=0; $i < count($players[$currentPlayerIndex]['bankOrder']); $i++) {
	echo $i;
	echo ", ";
	echo $players[$currentPlayerIndex]['bankOrder'][$i];
	echo " ... ";
	echo $bankCount;
	if ($players[$currentPlayerIndex]['bankOrder'][$i] >= $bankCount) {
		unset($players[$currentPlayerIndex]['bankOrder'][$i]);

		// disassociate
		$players[$currentPlayerIndex]['bankOrder'] = array_values($players[$currentPlayerIndex]['bankOrder']);
	}
}

// make sure every letter in the bank is represented in the bank order
for ($i=0; $i < count($players[$currentPlayerIndex]['letterBank']); $i++) {
	array_push($bankOrder, (int)$i);
}

// remove duplicates from the bank order
$bankOrder = array_values(array_unique($bankOrder));

// disassociate the bank order
$bankOrder = array_values($bankOrder);

// set the bank order of the current player
$players[$currentPlayerIndex]['bankOrder'] = $bankOrder;

// re-upload the players array
$playersJson = json_encode($players);

$sql = "UPDATE games SET players='$playersJson' WHERE id='$game'";
$query = mysqli_query($conn, $sql);
if ($query) {
    echo '{"errorLevel":0,"message":"The tile has been moved."}';
} else {
    echo '{"errorLevel":1,"message":"The tile could not be moved."}';
}

// close the connection
$conn->close();

?>