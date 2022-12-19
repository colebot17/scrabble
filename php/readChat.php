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

// get the player list and chat from the server
$sql = "SELECT players, chat FROM games WHERE id='$game'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$players = json_decode($row['players'], true);
$chat = json_decode($row['chat'], true);

// find out the most recent message id (the index of the last chat message)
$lastMessageId = count($chat) - 1;

// mark that message as the last message read
for ($i=0; $i < count($players); $i++) { 
    if ((int)$players[$i]['id'] === (int)$user) {
        $players[$i]['chatRead'] = (int)$lastMessageId;
    }
}

// reupload the player list to the server
$playersJson = json_encode($players);
$sql = "UPDATE games SET players='$playersJson' WHERE id='$game'";
$query = mysqli_query($conn, $sql);

echo '{"errorLevel":0,"message":"The chat has been marked as read"}';

// close the connection
$conn->close();

?>