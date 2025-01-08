<?php

// get data from GET/POST
$user = (int)$_POST['user'];
$pwd = $_POST['pwd'];
$gameId = (int)$_POST['gameId'];
$message = $_POST['message'];

require(__DIR__ . "/../util/getConn.php");
$conn = getConn();

// check password
require "../verifyPassword.php";
if (!verifyPassword($conn, $user, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// trim the message
$message = trim($message);

// save the un-escaped message for the notification later on
require_once __DIR__ . '/../util/decodeURIComponent.php';
$notifMessage = decodeURIComponent($message);

$message = htmlentities($message);
$message = str_replace("%0A", "<br>", $message);

// formulate the new chat message
$fullMessage = Array(
    "type" => "user",
    "sender" => (int)$user,
    "message" => $message,
    "timestamp" => date(DATE_ISO8601)
);

// add the chat message
require "addChatMessage.php";
$messageAdded = addChatMessage($conn, $gameId, $fullMessage);
if(!$messageAdded) exit('{"errorLevel":2,"message":"The message could not be sent."}');

// return success message
echo '{"errorLevel":0,"message":"Message Sent."}';

// notify the other players
$sql = "SELECT name, players FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$gameName = $row['name'];
$players = json_decode($row['players'], true);

$sql = "SELECT name FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$un = $row['name'];

$data = Array($un, $notifMessage, $gameName, $gameId);
require "../notifications/notify.php";

for ($i = 0; $i < count($players); $i++) {
    if ($players[$i]["id"] == $user) continue; // don't notify the sender of their own message

    notify($conn, $players[$i]["id"], "chat", $data);
}

// update the chat read marker of the player sending the message
require "updateChatRead.php";
updateChatRead($conn, $gameId, $user);

mysqli_close($conn);