<?php

// get data from GET/POST
$name = $_POST['name'];
$pwd = $_POST['pwd'];

require(__DIR__ . "/util/getConn.php");
$conn = getConn();

// check password
$sql = "SELECT pwd FROM accounts WHERE name='$name'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if ($row['pwd'] !== "" && !password_verify($pwd, $row['pwd'])) {
	exit('{"errorLevel":1,"message":"Incorrect username or password."}');
}

// define empty object to return
$obj = Array();

$obj['temporaryAccount'] = $row['pwd'] === "";

// get the id, name, etc.
$sql = "SELECT id, name, defaultLang, tutorials, notificationMethods FROM accounts WHERE name='$name'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$obj['id'] = (int)$row['id'];
$obj['name'] = $row['name'];
$obj['defaultLang'] = $row['defaultLang'];
$obj['tutorials'] = json_decode($row['tutorials'], true);

// don't send disabled notification methods
$notificationMethods = json_decode($row['notificationMethods'], true);
for ($i = 0; $i < count($notificationMethods); $i++) {
	if (array_key_exists('enabled', $notificationMethods[$i]) && $notificationMethods[$i]['enabled'] === false) {
		unset($notificationMethods[$i]);
	}
}
$notificationMethods = array_values($notificationMethods);
$obj['notificationMethods'] = $notificationMethods;

// get the games list
require "getGamesList.php";
$gamesList = getGamesList($conn, $obj['id']);
if ($gamesList === false) exit('{"errorLevel":2,"message":"Could not fetch games list"}');
$obj['games'] = $gamesList;

// get the full friends, requests, and sent requests lists
require "friends/getFriends.php";
$friends = getFriends($conn, $obj['id']);
$obj['friends'] = $friends;
$requests = getRequests($conn, $obj['id']);
$obj['requests'] = $requests;
$sentRequests = getSentRequests($conn, $obj['id']);
$obj['sentRequests'] = $sentRequests;


// return the success message along with the data
$res = Array(
	"errorLevel" => 0,
	"message" => "Sign-in successful.",
	"data" => $obj
);

echo json_encode($res);

// close the connection
mysqli_close($conn);

// log timestamp and location if signing into a temporary account
if ($obj['temporaryAccount']) {
	$logPath = "/home/hfcyju9l2xme/scrabble.colebot.com/tempAccLog.txt";
	$ip = $_SERVER['REMOTE_ADDR'];
	$ipLookup = json_decode(file_get_contents("http://ip-api.com/json/" . $ip), true);
	$ipLookupSummary = $ipLookup['city'] . ", " . $ipLookup['region'] . ", " . $ipLookup['countryCode'];
	$logText = $obj['name'] . " - " . date('Y-m-d H:i:s') . " - " . $ipLookupSummary . " - " . $ip . "\n";
	file_put_contents($logPath, $logText, FILE_APPEND);
}