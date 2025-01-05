<?php

// define connection
$servername = "173.201.180.187";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$name = $_POST['name'];
$pwd = $_POST['pwd'];

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

// check password
$sql = "SELECT pwd FROM accounts WHERE name='$name'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if ($row['pwd'] !== "" && !password_verify($pwd, $row['pwd'])) {
	exit('{"errorLevel":1,"message":"Incorrect username or password."}');
}

// define empty object to return
$obj = Array();

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