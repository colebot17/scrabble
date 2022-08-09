<?php

// define connection constants
$servername = "p3nlmysql21plsk.secureserver.net:3306";
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
$sql = "SELECT pwd FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if (!password_verify($pwd, $row['pwd'])) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// escape the new chat message content
$message = str_replace("'", "\'", $message);
$message = str_replace('"', '\"', $message);
$message = str_replace('`', '\`', $message);

$message = str_replace('_', '\_', $message);
$message = str_replace('%', '\%', $message);

$message = trim($message);

// formulate the new chat message
$newMessage = Array(
    "sender" => $user,
    "message" => $message,
    "timestamp" => date('Y-m-d H:i:s')
);

// get the chat
$sql = "SELECT chat FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$chat = json_decode($row['chat'], true);

// append the new message to the chat
array_push($chat, $newMessage);

// push the new chat back to the database
$sql = "UPDATE games SET chat='$chat' WHERE id='$gameId'";

?>