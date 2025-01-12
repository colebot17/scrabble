<?php

// get data from GET/POST
$userId = (int)$_POST['userId'];
$pwd = $_POST['pwd'];

require_once(__DIR__ . "/../util/getConn.php");
$conn = getConn();

// check password
require "../verifyPassword.php";
verifyPassword($conn, $userId, $pwd);

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