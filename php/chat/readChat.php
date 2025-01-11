<?php

require_once(__DIR__ . "/../util/getConn.php");
$conn = getConn();

// get data from POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$game = $_POST['game'];

// check password
require "../verifyPassword.php";
verifyPassword($conn, $user, $pwd);

require "updateChatRead.php";
$success = updateChatRead($conn, $game, $user);

if (!$success) exit('{"errorLevel":2,"message":"The chat could not be marked as read"}');

echo '{"errorLevel":0,"message":"The chat has been marked as read"}';

// close the connection
mysqli_close($conn);