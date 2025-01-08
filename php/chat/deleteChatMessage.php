<?php

// get data from GET/POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$gameId = $_POST['gameId'];
$messageId = $_POST['messageId'];

require_once(__DIR__ . "/../util/getConn.php");
$conn = getConn();

// check password
require "../verifyPassword.php";
if (!verifyPassword($conn, $user, $pwd)) {
	exit('{"errorLevel":2,"message":"Invalid Session"}');
}

// get the chat
$sql = "SELECT chat FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$chat = json_decode($row['chat'], true);

// make sure the user is playing by the rules
if (!$chat[$messageId]) {
    exit('{"errorLevel":2,"message":"Message does not exist."}');
}
if ($chat[$messageId]['sender'] != $user) {
    exit('{"errorLevel":2,"message":"You can only delete messages sent by you"}');
}

$delete = true;

// toggle 'deleted' on the chat message
if (array_key_exists('deleted', $chat[$messageId])) {
    $delete = !$chat[$messageId]['deleted'];
}
$chat[$messageId]['deleted'] = $delete;


// encode into JSON
$chatJson = json_encode($chat);

// escape content for SQL
$chatJson = str_replace("'", "\'", $chatJson);
$chatJson = str_replace('"', '\"', $chatJson);

// reupload the chat
$sql = "UPDATE games SET chat='$chatJson' WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
if (!$query) exit('{"errorLevel":1,"message":"Could not ' . ($delete ? 'delete' : 'restore') . ' message."}');

$response = Array(
    "errorLevel" => 0,
    "message" => "Message " . ($delete ? "deleted" : "restored") . ".",
);
if (!$delete) {
    // return the message content if we are restoring the message
    $response['data'] = $chat[$messageId]['message'];
}
echo json_encode($response);

//////////
// add to updates list
//////////

// generate the data
$updateData = Array(
    "messageId" => $messageId,
    "content" => $chat[$messageId]['message']
);

require "../addUpdate.php";
addUpdate($conn, $gameId, ($delete ? 'chatMessageDeletion' : 'chatMessageRestoration'), $updateData);

mysqli_close($conn);