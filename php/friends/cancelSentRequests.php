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

// prepare current user's info
$sql = "SELECT sentRequests FROM accounts WHERE id='$userId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$sentRequests = json_decode($row['sentRequests'], true);

// for each request to remove
for ($i = 0; $i < count($ids); $i++) {
    // remove from the current user's side

    if (($key = array_search($ids[$i], $sentRequests)) !== false) {
		unset($sentRequests[$key]);
		$sentRequests = array_values($sentRequests);
	}

    // remove from the other user's side
    $sql = "SELECT requests FROM accounts WHERE id='$ids[$i]'";
    $query = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($query);
    $requests = json_decode($row['requests'], true);

    if (($key = array_search((int)$userId, $requests)) !== false) {
		unset($requests[$key]);
		$requests = array_values($requests);
	}

    $requestsJson = json_encode($requests);
    $sql = "UPDATE accounts SET requests='$requestsJson' WHERE id='$ids[$i]'";
    $query = mysqli_query($conn, $sql);
}

// re-upload current user's info
$sentRequestsJson = json_encode($sentRequests);
$sql = "UPDATE accounts SET sentRequests='$sentRequestsJson' WHERE id='$userId'";
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