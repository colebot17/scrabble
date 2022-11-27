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
$messageId = $_POST['messageId'];

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

// get the chat
$sql = "SELECT chat FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$chat = json_decode($row['chat'], true);

// make sure the user is playing by the rules
if (!$chat[$messageId]) {
    exit('{"errorLevel":2,"message":"Message does not exist."}');
}
if ($chat[$messageId]['sender'] != $user) {
    exit('{"errorLevel":2,"message":"You can only delete messages sent by you"}');
}

// toggle 'deleted' on the chat message
$delete = !$chat[$messageId]["deleted"];
$chat[$messageId]["deleted"] = $delete;

// encode into JSON
$chatJson = json_encode($chat);

// reupload the chat
$sql = "UPDATE games SET chat='$chatJson' WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
if ($query) {
    echo '{"errorLevel":0,"message":"Message ' . ($delete ? 'deleted' : 'restored') . '."' . ($delete ? '' : ',"data":"' . $chat[$messageId][`message`] . '"') . '}';
} else {
    echo '{"errorLevel":1,"message":"Could not ' . ($delete ? 'delete' : 'restore') . ' message."}';
}

mysqli_close($conn);

?>