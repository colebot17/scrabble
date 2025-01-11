<?php

require_once(__DIR__ . "/../util/getConn.php");
$conn = getConn();

// get data from POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$gameId = $_POST['game'];

// check password
require "../verifyPassword.php";
verifyPassword($conn, $user, $pwd);

// remove the draft
require "draft.php";
setDraft($conn, $user, $gameId, null);

// close the connection
$conn->close();

echo '{"errorLevel":0,"message":"Draft Removed"}';