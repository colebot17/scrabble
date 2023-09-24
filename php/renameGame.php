<?php

// define connection
$servername = "173.201.180.187";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// get data from client
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$gameId = $_POST['game'];
$name = $_POST['name'];

// check password
require "verifyPassword.php";
if (!verifyPassword($conn, $user, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// make sure the game belongs to the user
$sql = "SELECT games FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$userGames = json_decode($row['games'], true);
if (!in_array($gameId, $userGames)) {
	exit('{"errorLevel":2,"message":"You do not own this game!"}');
}

// escape user input for JSON
$name = str_replace('"', '\"', $name);
$name = trim($name);

// escape user input for SQL
$uploadName = str_replace("'", "\'", $name);

// set the name
$sql = "UPDATE games SET name='$uploadName' WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);

if (!$query) {
    exit('{"errorLevel":1,"message":"Could not rename game"}');
}

echo '{"errorLevel":0,"message":"Game renamed to \"' . $name . '\".","data":"' . $name . '"}';

//////////
// add to updates list
//////////

// generate the data
$updateData = Array(
	"newName" => $name
);

if (file_exists("addUpdate.php")) {
	require "addUpdate.php";
	addUpdate($conn, $gameId, "chatMessageSend", $updateData);
}

if (file_exists("chat/addSystemMessage.php")) {
	// add system message to chat
	require "chat/addSystemChatMessage.php";
	$data = Array(
		"playerId" => $user,
		"newName" => $name
	);
	addSystemChatMessage($conn, $gameId, "gameRename", $data);
}

mysqli_close($conn);

?>