<?php

// get data from GET/POST
$userId = $_POST['user'];
$pwd = $_POST['pwd'];

require(__DIR__ . "/util/getConn.php");
$conn = getConn();

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