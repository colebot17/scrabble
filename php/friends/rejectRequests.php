<?php

// get data from GET/POST
$userId = (int)$_POST['userId'];
$pwd = $_POST['pwd'];
$ids = json_decode($_POST['ids'], true);

require(__DIR__ . "/../util/getConn.php");
$conn = getConn();

// check password
require "../verifyPassword.php";
if (!verifyPassword($conn, $userId, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// get requests list
$sql = "SELECT requests FROM accounts WHERE id='$userId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$requests = json_decode($row['requests'], true);

// for each request to be rejected
for ($i = 0; $i < count($ids); $i++) {
    // remove the request from the current user
    if (($key = array_search($ids[$i], $requests)) !== false) {
      unset($requests[$key]);
      $requests = array_values($requests);
    }

    // remove the sent request from the other user
    $sql = "SELECT sentRequests FROM accounts WHERE id='$ids[$i]'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    $sentRequests = json_decode($row['sentRequests'], true);

    if (($key = array_search($userId, $sentRequests)) !== false) {
      unset($sentRequests[$key]);
      $sentRequests = array_values($sentRequests);
    }

    // re-upload other user's sent requests
    $sentRequestsJson = json_encode($sentRequests);
    $otherUserFriendsJson = json_encode($otherUserFriends);
    $sql = "UPDATE accounts SET sentRequests='$sentRequestsJson' WHERE id='$ids[$i]'";
    $query = mysqli_query($conn, $sql);
}

// re-upload current user's requests
$friendsJson = json_encode($friends);
$requestsJson = json_encode($requests);
$sql = "UPDATE accounts SET requests='$requestsJson' WHERE id='$userId'";
$query = mysqli_query($conn, $sql);

// return the friends, requests, and sent requests
require "getFriends.php";
$listsList = getAllLists($conn, $userId);

$res = Array(
	"errorLevel" => 0,
	"message" => "Request" . (count($ids) === 1 ? "" : "s") . " Rejected.",
	"data" => $listsList
);

echo json_encode($res);

mysqli_close($conn);

?>