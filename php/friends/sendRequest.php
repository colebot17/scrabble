<?php

// define connection
$servername = "173.201.180.187";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$userId = (int)$_POST['userId'];
$pwd = $_POST['pwd'];
$friendName = $_POST['friendName'];

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

// get id from friend name
$sql = "SELECT id FROM accounts WHERE name='$friendName'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$friendId = (int)$row['id'];
if (mysqli_num_rows($query) === 0) {
    exit('{"errorLevel":1,"message":"The person you are trying to add doesn\'t exist."}');
}

// get friends and requests list
$sql = "SELECT friends, requests, sentRequests FROM accounts WHERE id='$userId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$friends = json_decode($row['friends'], true);
$requests = json_decode($row['requests'], true);
$sentRequests = json_decode($row['sentRequests'], true);

// cannot add yourself
if ($friendId == $userId) {
    exit('{"errorLevel":1,"message":"You cannot be friends with yourself."}');
}

// check if already friends
if (array_search($friendId, $friends)) {
    exit('{"errorLevel":1,"message":"You are already friends with this person."}');
}

// check if request already received
if (array_search($friendId, $requests)) {
	exit('{"errorLevel":1,"message":"This person has already sent a request to you."}');
}

// check if request already sent
if (array_search($friendId, $sentRequests)) {
    exit('{"errorLevel":1,"message":"You have already sent a request to this person."}');
}

// add to sent requests
$sentRequests[] = (int)$friendId;

// re-upload the sent requests list
$sentRequestsJson = json_encode($sentRequests);
$sql = "UPDATE accounts SET sentRequests='$sentRequestsJson' WHERE id='$userId'";
$query = mysqli_query($conn, $sql);

// update the other user's request list
$sql = "SELECT requests, name FROM accounts WHERE id='$friendId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$requests = json_decode($row['requests'], true);
$friendName = $row['name']; // this is for the email notification, later

$requests[] = (int)$userId;

$requestsJson = json_encode($requests);
$sql = "UPDATE accounts SET requests='$requestsJson' WHERE id='$friendId'";
$query = mysqli_query($conn, $sql);


// get the full requests list to return to the client
require "getFriends.php";
$listsList = getAllLists($conn, $userId);

$res = Array(
	"errorLevel" => 0,
	"message" => "Friend Added.",
	"data" => $listsList
);
echo json_encode($res);

// send a notification email
require "../notifications/notify.php";
require "../notificaions/templates/friendRequestEmail.php";

notifyByEmail($conn, $friendId, ...friendRequestEmail($friendName));

mysqli_close($conn);