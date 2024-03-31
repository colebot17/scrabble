<?php

// define connection
$servername = "173.201.180.187";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$gameId = $_POST['gameId'];
$message = $_POST['message'];

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// check password
require "../verifyPassword.php";
if (!verifyPassword($conn, $user, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// trim the message
$message = trim($message);
$message = htmlentities($message);
$message = str_replace(PHP_EOL, "<br>", $message);

// formulate the new chat message
$fullMessage = Array(
    "type" => "user",
    "sender" => (int)$user,
    "message" => $message,
    "timestamp" => date(DATE_ISO8601)
);

// add the chat message
require "addChatMessage.php";
$messageAdded = addChatMessage($conn, $gameId, $fullMessage);
if(!$messageAdded) exit('{"errorLevel":2,"message":"The message could not be sent."}');

// return success message
echo '{"errorLevel":0,"message":"Message Sent."}';

// update the chat read marker of the player sending the message
require "updateChatRead.php";
updateChatRead($conn, $gameId, $user);

mysqli_close($conn);