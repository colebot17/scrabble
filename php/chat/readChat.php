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

// get data from POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$game = $_POST['game'];

// check password
require "../verifyPassword.php";
if (!verifyPassword($conn, $user, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

require "updateChatRead.php";
$success = updateChatRead($conn, $game, $user);

if ($success) {
    echo '{"errorLevel":0,"message":"The chat has been marked as read"}';
} else {
    echo '{"errorLevel":2,"message":"The chat could not be marked as read"}';
}

// close the connection
$conn->close();

?>