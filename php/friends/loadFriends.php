<?php

// get data from GET/POST
$userId = (int)$_POST['userId'];
$pwd = $_POST['pwd'];

require(__DIR__ . "/../util/getConn.php");
$conn = getConn();

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