<?php

// define connection
$servername = "173.201.180.187";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$userId = $_POST['user'];
$pwd = $_POST['pwd'];

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// check password
require "verifyPassword.php";
if (!verifyPassword($conn, $userId, $pwd)) exit('{"errorLevel":2,"message":"Invalid Session"}');

// get the games list
require "getGamesList.php";
$list = getGamesList($conn, $userId);

// make sure a list was actually returned
if ($list === false) exit('{"errorLevel":2,"message":"Could not fetch games list"}');

// return the games object
$res = Array(
	"errorLevel" => 0,
	"data" => $list
);

echo json_encode($res);

// close the connection
mysqli_close($conn);