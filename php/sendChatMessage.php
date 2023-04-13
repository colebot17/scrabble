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

// trim the message
$message = trim($message);

// formulate the new chat message
$fullMessage = Array(
    "type" => "user",
    "sender" => (int)$user,
    "message" => $message,
    "timestamp" => date(DATE_ISO8601)
);

// get the chat
$sql = "SELECT chat FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$chat = json_decode($row['chat'], true);

// append the new message to the chat
array_push($chat, $fullMessage);

// encode into JSON
$chatJson = json_encode($chat);

// escape content for SQL
$chatJson = str_replace("'", "\'", $chatJson);
$chatJson = str_replace('"', '\"', $chatJson);

// reupload the chat
$sql = "UPDATE games SET chat='$chatJson' WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
if ($query) {
    echo '{"errorLevel":0,"message":"Message Sent."}';
} else {
    exit('{"errorLevel":1,"message":"Could not send message."}');
}

// get the player list
$sql = "SELECT players FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$players = json_decode($row['players'], true);

// update the read marker of the user sending the message
for ($i=0; $i < count($players); $i++) { 
    if ($players[$i]['id'] == $user) {
        $players[$i]['chatRead'] = count($chat) - 1;
    }
}

// reupload the player list
$playersJson = json_encode($players);
$sql = "UPDATE games SET players='$playersJson' WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);

// add to update list
$sql = "SELECT updates FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$updates = json_decode($row['updates'], true);

array_push($updates, Array(
    "type" => "chatMessageSend",
    "data" => Array(
        "message" => $fullMessage,
        "senderName" => mysqli_fetch_assoc(mysqli_query($conn, "SELECT name FROM accounts WHERE id='$user'"))['name']
    ),
    "timestamp" => time()
));

$updatesJson = json_encode($updates);
$updatesJson = str_replace("'", "\'", $updatesJson);
$updatesJson = str_replace('"', '\"', $updatesJson);
$sql = "UPDATE games SET updates='$updatesJson' WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);

mysqli_close($conn);

?>