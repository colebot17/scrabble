<?php

// define connection
$servername = "p3nlmysql21plsk.secureserver.net:3306";
$username = "Colebot";
$password = "96819822";
$dbname = "scrabble";

// get data from GET/POST
$user = $_POST['user'];
$pwd = $_POST['pwd'];
$gameId = $_POST['game'];
$lastUpdateClient = $_POST['lastUpdate'];

// create and check connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
	die('{"errorLevel":2,"message":"Server Error: ' . $conn->connect_error . '}');
}

// check password
$sql = "SELECT pwd FROM accounts WHERE id='$user'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
if (!password_verify($pwd, $row['pwd'])) {
	exit('{"errorLevel":2,"message":"Invalid Session","debug":"' . $user . ' ' . $pwd . '"}');
}

// get the last update for comparison
$sql = "SELECT lastUpdate FROM games WHERE id='$gameId'";
$query = mysqli_query($conn, $sql);
$row = mysqli_fetch_assoc($query);
$lastUpdateServer = $row['lastUpdate'];

if ($lastUpdateServer > $lastUpdateClient) {
    echo '{"errorLevel":0,data: 1,"message":"There is new game data available on the server."}';
} else {
    echo '{"errorLevel":0,data: 0,"message":"You\'re all caught up!"}';
}

// close the connection
$conn->close();

?>