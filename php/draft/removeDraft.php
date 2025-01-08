<?php

require(__DIR__ . "/../util/getConn.php");
$conn = getConn();

// get data from POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$gameId = $_POST['game'];

// check password
require "../verifyPassword.php";
if (!verifyPassword($conn, $user, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// remove the draft
require "draft.php";
setDraft($conn, $user, $gameId, null);

// close the connection
$conn->close();

echo '{"errorLevel":0,"message":"Draft Removed"}';