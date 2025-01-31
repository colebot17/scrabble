<?php

// get data from GET/POST
$userId = (int)$_POST['userId'];
$pwd = $_POST['pwd'];
$friendName = $_POST['friendName'];

require_once(__DIR__ . "/../util/getConn.php");
$conn = getConn();

// check password
require "../verifyPassword.php";
verifyPassword($conn, $userId, $pwd);

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
$listsList = getAllLists($conn, $userId);

$res = Array(
	"errorLevel" => 0,
	"message" => "Friend Added.",
	"data" => $listsList
);
echo json_encode($res);

mysqli_close($conn);

?>