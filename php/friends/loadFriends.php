<?php

// define connection
$servername = "173.201.180.187";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$userId = (int)$_POST['userId'];
$pwd = $_POST['pwd'];

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

require "getFriends.php";
$listsList = getAllLists($conn, $userId);

$res = Array(
    "errorLevel" => 0,
    "message" => "Friend list returned.",
    "data" => $listsList
);

echo json_encode($res);

mysqli_close($conn);

?>