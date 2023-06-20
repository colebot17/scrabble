<?php

// define connection
$servername = "173.201.180.187";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$userId = (int)$_POST['userId'];
$pwd = $_POST['pwd'];
$friendIds = json_decode($_POST['friendIds'], true);

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// check password
require "../verifyPassword.php";
if (!verifyPassword($conn, $userId, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// get friends list
$sql = "SELECT friends FROM accounts WHERE id='$userId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$friends = json_decode($row['friends'], true);

// find and remove each friend
for ($i = 0; $i < count($friendIds); $i++) {
	// remove from current user
	if (($key = array_search($friendIds[$i], $friends)) !== false) {
		unset($friends[$key]);
		$friends = array_values($friends);
	}

	// remove from other user
	$sql = "SELECT friends FROM accounts WHERE id='$friendIds[$i]'";
	$query = mysqli_query($conn, $sql);
	$row = mysqli_fetch_assoc($query);
	$otherUserFriends = json_decode($row['friends'], true);

	if (($key = array_search($userId, $otherUserFriends)) !== false) {
		unset($otherUserFriends[$key]);
		$otherUserFriends = array_values($otherUserFriends);
	}

	$otherUserFriendsJson = json_encode($otherUserFriends);
	$sql = "UPDATE accounts SET friends='$otherUserFriendsJson' WHERE id='$friendIds[$i]'";
	$query = mysqli_query($conn, $sql);
}

// re-upload the friends list
$friendsJson = json_encode($friends);
$sql = "UPDATE accounts SET friends='$friendsJson' WHERE id='$userId'";
$query = mysqli_query($conn, $sql);

require "getFriends.php";
$listsList = getAllLists($conn, $userId);

$res = Array(
	"errorLevel" => 0,
	"message" => "Friend Removed.",
	"data" => $listsList
);

echo json_encode($res);

mysqli_close($conn);

?>