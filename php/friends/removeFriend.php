<?php

// define connection
$servername = "p3nlmysql21plsk.secureserver.net:3306";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$userId = $_POST['userId'];
$pwd = $_POST['pwd'];
$friendId = $_POST['friendId'];

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// check password
$sql = "SELECT pwd FROM accounts WHERE id='$userId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if (!password_verify($pwd, $row['pwd'])) {
	exit('{"errorLevel":2,"message":"Invalid Session!"}');
}

// get friends list
$sql = "SELECT friends FROM accounts WHERE id='$userId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$friends = json_decode($row['friends'], true);

// find and remove the friend
if (($key = array_search($friendId, $friends)) !== false) {
    unset($friends[$key]);
}

// re-upload the friends list
$friendsJson = json_encode($friends);
$sql = "UPDATE accounts SET friends='$friendsJson' WHERE id='$userId'";
$query = mysqli_query($conn, $sql);

require "getFriends.php";
$friendsList = getFriends($conn, $userId);

$res = Array(
	"errorLevel" => 0,
	"message" => "Friend Removed.",
	"data" => $friendsList
);

echo json_encode($res);

mysqli_close($conn);

?>