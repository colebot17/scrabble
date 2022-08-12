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
$from = $_POST['from'];
$to = $_POST['to'];

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

// get the letter bank of the current player
$letterBank = $players[array_search($user, $playerList)]['letterBank'];

// get the letter
$letter = $letterBank[$from];

// remove the letter from the bank
array_splice($letterBank, $from, 1);

// insert it into the bank in its new position
array_splice($letterBank, ++$to, 0, $letter);

// re-upload the letter bank in the player list
$players[array_search($user, $playerList)]['letterBank'] = $letterBank;
$playersJson = json_encode($players);

$sql = "UPDATE games SET players='$playersJson' WHERE id='$game'";
//$query = mysqli_query($conn, $sql);
if ($query) {
    echo '{"errorLevel":0,"message":"The tile has been moved."}';
} else {
    echo '{"errorLevel":1,"message":"The tile could not be moved."}';
}

// close the connection
$conn->close();

?>