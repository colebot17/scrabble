<?php

// define connection
$servername = "p3nlmysql21plsk.secureserver.net:3306";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$userId = $_POST['userId'];
$pwd = $_POST['pwd'];
$friendName = $_POST['friendName'];

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

// get id from friend name
$sql = "SELECT id FROM accounts WHERE name='$friendName'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$friendId = $row['id'];
if (mysqli_num_rows($query) === 0) {
    exit('{"errorLevel":1,"message":"The person you are trying to add doesn\'t exist."}');
}

// get friends list
$sql = "SELECT friends FROM accounts WHERE id='$userId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$friends = json_decode($row['friends'], true);

// cannot add yourself
if ($friendId == $userId) {
    exit('{"errorLevel":1,"message":"You cannot be friends with yourself."}');
}

// check if already friends
if (array_search($friendId, $friends)) {
    exit('{"errorLevel":1,"message":"You are already friends with this person."}');
}

// add the friend
$friends[] = (int)$friendId;

// re-upload the friends list
$friendsJson = json_encode($friends);
$sql = "UPDATE accounts SET friends='$friendsJson' WHERE id='$userId'";
$query = mysqli_query($conn, $sql);

require "getFriends.php";
$friendsList = getFriends($conn, $userId);

$res = Array(
	"errorLevel" => 0,
	"message" => "Friend Added.",
	"data" => $friendsList
);
echo json_encode($res);

mysqli_close($conn);

?>