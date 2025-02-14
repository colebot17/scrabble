<?php

// get data from GET/POST
$userId = (int)$_POST['userId'];
$pwd = $_POST['pwd'];
$ids = json_decode($_POST['ids'], true);

require_once(__DIR__ . "/../util/getConn.php");
$conn = getConn();

// check password
require "../verifyPassword.php";
verifyPassword($conn, $userId, $pwd);

// get friends and requests list
$sql = "SELECT friends, requests FROM accounts WHERE id='$userId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$friends = json_decode($row['friends'], true);
$requests = json_decode($row['requests'], true);

// for each request
for ($i = 0; $i < count($ids); $i++) {
    // remove the request from the current user
    if (($key = array_search($ids[$i], $requests)) !== false) {
      unset($requests[$key]);
      $requests = array_values($requests);
    }

    // remove the sent request from the other user
    $sql = "SELECT sentRequests, friends FROM accounts WHERE id='$ids[$i]'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    $sentRequests = json_decode($row['sentRequests'], true);
    $otherUserFriends = json_decode($row['friends'], true);

    if (($key = array_search($userId, $sentRequests)) !== false) {
      unset($sentRequests[$key]);
      $sentRequests = array_values($sentRequests);
    }

    // add the friend to each list
    $friends[] = (int)$ids[$i];
    $otherUserFriends[] = (int)$userId;

    // re-upload other user's stuff
    $sentRequestsJson = json_encode($sentRequests);
    $otherUserFriendsJson = json_encode($otherUserFriends);
    $sql = "UPDATE accounts SET sentRequests='$sentRequestsJson', friends='$otherUserFriendsJson' WHERE id='$ids[$i]'";
    $query = mysqli_query($conn, $sql);
}

// re-upload current user's stuff
$friendsJson = json_encode($friends);
$requestsJson = json_encode($requests);
$sql = "UPDATE accounts SET friends='$friendsJson', requests='$requestsJson' WHERE id='$userId'";
$query = mysqli_query($conn, $sql);

// return the friends, requests, and sent requests
require "getFriends.php";
$listsList = getAllLists($conn, $userId);

$res = Array(
	"errorLevel" => 0,
	"message" => "Request" . (count($ids) === 1 ? "" : "s") . " Accepted.",
	"data" => $listsList
);

echo json_encode($res);

mysqli_close($conn);

?>